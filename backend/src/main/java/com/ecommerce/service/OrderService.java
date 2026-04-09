package com.ecommerce.service;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.ShippingAddressDTO;
import com.ecommerce.entity.*;
import com.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CartService cartService;
    
    public List<OrderDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderDTO::fromOrder)
                .collect(Collectors.toList());
    }
    
    public Page<OrderDTO> getUserOrdersPaged(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderDTO::fromOrder);
    }
    
    public OrderDTO getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        
        return OrderDTO.fromOrder(order);
    }
    
    public OrderDTO getOrderByNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        
        return OrderDTO.fromOrder(order);
    }
    
    @Transactional
    public OrderDTO createOrder(Long userId, ShippingAddressDTO shippingAddressDTO, String paymentMethod, String notes, List<Integer> productIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        
        // Filter cart items if productIds are provided (Buy Now functionality)
        List<CartItem> itemsToOrder;
        if (productIds != null && !productIds.isEmpty()) {
            System.out.println("=== BUY NOW MODE ===");
            System.out.println("Product IDs to order: " + productIds);
            
            // Try to find products in cart first
            itemsToOrder = cart.getItems().stream()
                    .filter(item -> productIds.contains(item.getProduct().getId()))
                    .collect(java.util.stream.Collectors.toList());
            
            // If products not in cart, create temporary cart items (direct product ordering)
            if (itemsToOrder.isEmpty()) {
                System.out.println("Products not in cart, creating temporary order items...");
                itemsToOrder = new java.util.ArrayList<>();
                
                for (Integer productId : productIds) {
                    Product product = productRepository.findById(productId.longValue())
                            .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
                    
                    if (!product.isActive()) {
                        throw new RuntimeException("Product is not available: " + product.getName());
                    }
                    
                    if (product.getStockQuantity() < 1) {
                        throw new RuntimeException("Product out of stock: " + product.getName());
                    }
                    
                    // Create temporary cart item
                    CartItem tempItem = new CartItem();
                    tempItem.setProduct(product);
                    tempItem.setQuantity(1);
                    tempItem.setCart(cart);
                    itemsToOrder.add(tempItem);
                    
                    System.out.println("Added product: " + product.getName() + " (ID: " + productId + ")");
                }
            } else {
                System.out.println("Found " + itemsToOrder.size() + " item(s) in cart");
            }
            
            if (itemsToOrder.isEmpty()) {
                throw new RuntimeException("Selected products not found");
            }
            
            System.out.println("Ordering " + itemsToOrder.size() + " specific item(s)");
        } else {
            // Order all items in cart
            if (cart.getItems().isEmpty()) {
                throw new RuntimeException("Cart is empty. Add items before checkout.");
            }
            
            itemsToOrder = new java.util.ArrayList<>(cart.getItems());
            System.out.println("=== FULL CART ORDER ===");
            System.out.println("Ordering all " + itemsToOrder.size() + " item(s) from cart");
        }
        
        // Validate stock
        for (CartItem cartItem : itemsToOrder) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }
        }
        
        // Calculate totals - No tax, no shipping (FREE delivery)
        BigDecimal subtotal = itemsToOrder.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = BigDecimal.ZERO; // No tax
        BigDecimal shippingCost = BigDecimal.ZERO; // Free shipping
        BigDecimal total = subtotal; // Total equals subtotal
        
        System.out.println("=== ORDER CALCULATION ===");
        System.out.println("Subtotal: ₹" + subtotal);
        System.out.println("Tax: ₹" + tax);
        System.out.println("Shipping: ₹" + shippingCost + " (FREE)");
        System.out.println("Total: ₹" + total);
        
        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setShippingAddress(shippingAddressDTO.toEntity());
        order.setPaymentMethod(paymentMethod);
        order.setNotes(notes);
        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setShippingCost(shippingCost);
        order.setTotal(total);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        
        // Create order items and update stock
        for (CartItem cartItem : itemsToOrder) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setProductPrice(cartItem.getProduct().getDiscountPrice() != null ? 
                    cartItem.getProduct().getDiscountPrice() : cartItem.getProduct().getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setSubtotal(cartItem.getSubtotal());
            order.getItems().add(orderItem);
            
            System.out.println("Item: " + orderItem.getProductName() + 
                             " | Price: " + orderItem.getProductPrice() + 
                             " | Qty: " + orderItem.getQuantity() + 
                             " | Subtotal: " + orderItem.getSubtotal());
            
            // Update stock
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }
        
        order = orderRepository.save(order);
        
        // Force refresh to ensure all fields are persisted
        order = orderRepository.findById(order.getId()).orElseThrow();
        
        System.out.println("=== SAVED ORDER ===");
        System.out.println("Order ID: " + order.getId());
        System.out.println("Order Number: " + order.getOrderNumber());
        System.out.println("Saved Subtotal: " + order.getSubtotal());
        System.out.println("Saved Total: " + order.getTotal());
        
        // Clear cart
        cartService.clearCart(userId);
        
        // Send confirmation email - REMOVED
        // try {
        //     emailService.sendOrderConfirmationEmail(user.getEmail(), order.getOrderNumber(), user.getFirstName());
        // } catch (Exception e) {
        //     System.err.println("Failed to send order confirmation: " + e.getMessage());
        // }
        
        return OrderDTO.fromOrder(order);
    }
    
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(status);
        
        if (status == Order.OrderStatus.CONFIRMED) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
        } else if (status == Order.OrderStatus.SHIPPED) {
            order.setShippedAt(LocalDateTime.now());
        } else if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        
        order = orderRepository.save(order);
        return OrderDTO.fromOrder(order);
    }
    
    @Transactional
    public OrderDTO cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify ownership - force initialization of user proxy
        User user = order.getUser();
        if (user == null || !user.getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to cancel this order");
        }
        
        // Only allow cancellation of pending or confirmed orders
        if (order.getStatus() == Order.OrderStatus.SHIPPED || 
            order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel order that has been shipped");
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        
        // Note: cancelledAt field doesn't exist in entity, skipping
        // order.setCancelledAt(LocalDateTime.now());
        
        // Restore stock quantities
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        
        order = orderRepository.save(order);
        return OrderDTO.fromOrder(order);
    }
    
    // Admin methods
    public Page<OrderDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(OrderDTO::fromOrder);
    }
    
    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

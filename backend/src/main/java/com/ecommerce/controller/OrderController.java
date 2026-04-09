package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.ShippingAddressDTO;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://e-commercewebsite-production-f9f6.up.railway.app",
        "https://e-commercewebsite-production-40de.up.railway.app",
        "https://e-commercewebsite-production-73fb.up.railway.app",
        "https://web-production-bef07.up.railway.app",
        "https://splendid-hope-production-fb0d.up.railway.app"
    },
    allowCredentials = "true"
)
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<OrderDTO> orders = orderService.getUserOrders(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/paged")
    public ResponseEntity<?> getUserOrdersPaged(Authentication authentication,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            Page<OrderDTO> orders = orderService.getUserOrdersPaged(userId, page, size);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(Authentication authentication, @PathVariable Long orderId) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            OrderDTO order = orderService.getOrderById(orderId, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<?> trackOrder(Authentication authentication, @PathVariable String orderNumber) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            OrderDTO order = orderService.getOrderByNumber(orderNumber, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> createOrder(Authentication authentication,
                                         @RequestBody Map<String, Object> request) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            
            Map<String, Object> addressMap = (Map<String, Object>) request.get("shippingAddress");
            ShippingAddressDTO addressDTO = new ShippingAddressDTO();
            addressDTO.setFirstName((String) addressMap.get("firstName"));
            addressDTO.setLastName((String) addressMap.get("lastName"));
            addressDTO.setPhone((String) addressMap.get("phone"));
            addressDTO.setStreet((String) addressMap.get("street"));
            addressDTO.setCity((String) addressMap.get("city"));
            addressDTO.setState((String) addressMap.get("state"));
            addressDTO.setZipCode((String) addressMap.get("zipCode"));
            addressDTO.setCountry((String) addressMap.get("country"));
            
            String paymentMethod = (String) request.get("paymentMethod");
            String notes = (String) request.get("notes");
            
            // Optional: Get product IDs for "Buy Now" functionality
            List<Integer> productIds = null;
            if (request.containsKey("productIds")) {
                productIds = (List<Integer>) request.get("productIds");
            }
            
            OrderDTO order = orderService.createOrder(userId, addressDTO, paymentMethod, notes, productIds);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order placed successfully");
            response.put("data", order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(Authentication authentication, @PathVariable Long orderId) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            OrderDTO order = orderService.cancelOrder(orderId, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order cancelled successfully");
            response.put("data", order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

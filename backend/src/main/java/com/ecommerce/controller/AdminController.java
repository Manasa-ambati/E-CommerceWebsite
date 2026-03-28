package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://e-commercewebsite-production-40de.up.railway.app",
        "https://web-production-bef07.up.railway.app"
    },
    allowCredentials = "true"
)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private OrderService orderService;
    
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Page<OrderDTO> orders = orderService.getAllOrders(page, size);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", orders);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
                                               @RequestParam String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            OrderDTO order = orderService.updateOrderStatus(orderId, orderStatus);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order status updated");
            response.put("data", order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

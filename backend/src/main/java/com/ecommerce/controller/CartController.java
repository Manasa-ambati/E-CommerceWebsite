package com.ecommerce.controller;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://e-commercewebsite-production-40de.up.railway.app",
        "https://web-production-bef07.up.railway.app"
    },
    allowCredentials = "true"
)
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getCart(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cart = cartService.getCart(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", cart);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(Authentication authentication, 
                                       @RequestParam Long productId,
                                       @RequestParam(defaultValue = "1") Integer quantity) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cart = cartService.addToCart(userId, productId, quantity);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product added to cart");
            response.put("data", cart);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(Authentication authentication,
                                            @RequestParam Long productId,
                                            @RequestParam Integer quantity) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cart = cartService.updateCartItem(userId, productId, quantity);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cart updated");
            response.put("data", cart);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(Authentication authentication,
                                            @RequestParam Long productId) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cart = cartService.removeFromCart(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product removed from cart");
            response.put("data", cart);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            cartService.clearCart(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cart cleared");
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

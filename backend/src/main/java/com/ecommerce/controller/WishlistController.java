package com.ecommerce.controller;

import com.ecommerce.dto.WishlistItemDTO;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class WishlistController {
    
    @Autowired
    private WishlistService wishlistService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getWishlist(Authentication authentication) {
        try {
            System.out.println("=== GET /api/wishlist ===");
            System.out.println("Authentication: " + (authentication != null ? "Present" : "Null"));
            System.out.println("Principal: " + (authentication != null ? authentication.getPrincipal() : "N/A"));
            
            Long userId = getUserIdFromAuthentication(authentication);
            System.out.println("User ID: " + userId);
            
            List<WishlistItemDTO> wishlist = wishlistService.getUserWishlist(userId);
            System.out.println("Wishlist size: " + wishlist.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", wishlist);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in getWishlist: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(Authentication authentication, @RequestParam Long productId) {
        try {
            System.out.println("=== POST /api/wishlist/add ===");
            System.out.println("Product ID: " + productId);
            System.out.println("Authentication: " + (authentication != null ? "Present" : "Null"));
            
            Long userId = getUserIdFromAuthentication(authentication);
            System.out.println("User ID: " + userId);
            
            WishlistItemDTO item = wishlistService.addToWishlist(userId, productId);
            System.out.println("Added item with ID: " + item.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product added to wishlist");
            response.put("data", item);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in addToWishlist: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromWishlist(Authentication authentication, @RequestParam Long productId) {
        try {
            System.out.println("=== DELETE /api/wishlist/remove ===");
            System.out.println("Product ID: " + productId);
            System.out.println("Authentication: " + (authentication != null ? "Present" : "Null"));
            
            Long userId = getUserIdFromAuthentication(authentication);
            System.out.println("User ID: " + userId);
            
            wishlistService.removeFromWishlist(userId, productId);
            System.out.println("Removed successfully");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product removed from wishlist");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in removeFromWishlist: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkWishlist(Authentication authentication, @RequestParam Long productId) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", isInWishlist);
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

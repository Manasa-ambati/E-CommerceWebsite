package com.ecommerce.controller;

import com.ecommerce.dto.ReviewDTO;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtUtil;
import com.ecommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByProduct(productId);
            response.put("success", true);
            response.put("data", reviews);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/product/{productId}")
    public ResponseEntity<?> addProductReview(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            // Get user from database
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Integer rating = (Integer) request.get("rating");
            String comment = (String) request.get("comment");
            
            if (rating == null || rating < 1 || rating > 5) {
                response.put("success", false);
                response.put("message", "Rating must be between 1 and 5");
                return ResponseEntity.badRequest().body(response);
            }
            
            ReviewDTO review = reviewService.addReview(productId, user.getId(), rating, comment);
            
            response.put("success", true);
            response.put("data", review);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkUserReview(
            @PathVariable Long productId,
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            // Get user from database
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean hasReviewed = reviewService.hasUserReviewed(productId, user.getId());
            
            response.put("success", true);
            response.put("data", hasReviewed);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

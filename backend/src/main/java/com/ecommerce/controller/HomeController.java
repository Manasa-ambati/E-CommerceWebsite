package com.ecommerce.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to ShopEase E-Commerce API");
        response.put("status", "Running");
        response.put("version", "1.0.0");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Authentication", "/api/auth/login");
        endpoints.put("Products", "/api/products");
        endpoints.put("Categories", "/api/categories");
        endpoints.put("Cart", "/api/cart");
        endpoints.put("Wishlist", "/api/wishlist");
        endpoints.put("Orders", "/api/orders");
        
        response.put("available_endpoints", endpoints);
        
        return response;
    }
    
    // Catch-all route for React Router - serves index.html for all non-API routes
    @RequestMapping(value = {
        "/{path:[^\\.]*}",
        "/{anyPaths:(?!api\\/)(?:.*)}"
    })
    public ResponseEntity<Resource> forwardToIndex() {
        ClassPathResource resource = new ClassPathResource("static/index.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }
}

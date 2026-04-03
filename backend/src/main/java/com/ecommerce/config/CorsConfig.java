package com.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // List all frontend URLs that will call this backend
                        .allowedOrigins(
                                "https://e-commercewebsite-production-40de.up.railway.app",
                                "https://web-production-bef07.up.railway.app",
                                "http://localhost:3000",
                                "http://localhost:3001"
                        )
                        // HTTP methods you want to allow
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        // Headers that frontend can send
                        .allowedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept")
                        // Headers frontend can access
                        .exposedHeaders("Authorization", "Content-Type")
                        // Enable credentials (cookies, JWT in headers)
                        .allowCredentials(true)
                        // Cache preflight response for 1 hour
                        .maxAge(3600);
            }
        };
    }
}
package com.ecommerce.config;

import com.ecommerce.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

      http
          .csrf(csrf -> csrf.disable())
         .cors(cors -> cors.configure(http))
         .authorizeHttpRequests(auth -> auth
             // Public APIs - must be before any authenticated rules
             .requestMatchers("/api/auth/**").permitAll()
             .requestMatchers("/api/products/**").permitAll()
             .requestMatchers("/api/categories/**").permitAll()
             .requestMatchers("/api/home/**").permitAll()
             
             // Protected APIs
             .requestMatchers("/api/cart/**").authenticated()
             .requestMatchers("/api/orders/**").authenticated()
             .requestMatchers("/api/wishlist/**").authenticated()
             .requestMatchers("/api/reviews/**").authenticated()

             // Admin APIs
             .requestMatchers("/api/admin/**").hasRole("ADMIN")

             // Any other request - permit all for development
             .anyRequest().permitAll()
         )
         .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
   }
}

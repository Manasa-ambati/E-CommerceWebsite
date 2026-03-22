package com.ecommerce.controller;

import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        try {
            System.out.println("=== POST /api/auth/signup ===");
            System.out.println("Request: " + request);

            String name = request.get("name");
            String email = request.get("email");
            String password = request.get("password");
            String phone = request.get("phone");

            // Validation
            if (name == null || name.trim().isEmpty()) {
                return badRequest("Name is required");
            }
            if (email == null || email.trim().isEmpty()) {
                return badRequest("Email is required");
            }
            if (password == null || password.length() < 6) {
                return badRequest("Password must be at least 6 characters");
            }
            if (phone == null || phone.trim().isEmpty()) {
                return badRequest("Phone is required");
            }

            // Split name into first and last name
            String[] nameParts = name.trim().split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "User";

            // Check if email already exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                return badRequest("Email already registered");
            }

            // Create new user
            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setPhone(phone);
            user.setRole(User.Role.CUSTOMER);
            user.setEmailVerified(false); // Require OTP verification
            
            // Generate OTP
            String otp = String.format("%06d", (int)(Math.random() * 1000000));
            user.setOtp(otp);
            user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));

            userRepository.save(user);
            System.out.println("User created successfully: " + email);
            System.out.println("OTP for " + email + ": " + otp); // For demo purposes

            // Prepare response - don't send token yet, need OTP verification first
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("email", email);
            responseData.put("requiresOtp", true);
            responseData.put("message", "Please verify your email with OTP");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Signup successful. Please verify your email.");
            response.put("data", responseData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in signup: " + e.getMessage());
            e.printStackTrace();
            return badRequest("Signup failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            System.out.println("=== POST /api/auth/login ===");
            System.out.println("Email: " + request.get("email"));

            String email = request.get("email");

            if (email == null || email.trim().isEmpty()) {
                return badRequest("Email is required");
            }

            // Check if user exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            
            if (!existingUser.isPresent()) {
                // New user - ask for signup details
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("email", email);
                responseData.put("isNewUser", true);
                responseData.put("message", "Please provide your details to continue");
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "New user detected. Please complete registration.");
                response.put("data", responseData);
                
                return ResponseEntity.ok(response);
            }
            
            // Existing user - send OTP for login
            User user = existingUser.get();
            
            // Generate OTP
            String otp = String.format("%06d", (int)(Math.random() * 1000000));
            user.setOtp(otp);
            user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            
            System.out.println("OTP for " + email + ": " + otp); // For demo purposes
            
            // Prepare response - ask for OTP
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("email", email);
            responseData.put("requiresOtp", true);
            responseData.put("message", "Please enter OTP sent to your email");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP sent successfully");
            response.put("data", responseData);
            
            System.out.println("OTP sent for: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in login: " + e.getMessage());
            e.printStackTrace();
            return badRequest("Login failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            
            System.out.println("=== POST /api/auth/verify-otp ===");
            System.out.println("Email: " + email + ", OTP: " + otp);
            
            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify OTP
            if (otp == null || otp.length() != 6 || !otp.equals(user.getOtp())) {
                return badRequest("Invalid OTP. Please enter correct 6-digit code.");
            }
            
            // Check OTP expiry
            if (user.getOtpExpiry() != null && java.time.LocalDateTime.now().isAfter(user.getOtpExpiry())) {
                return badRequest("OTP expired. Please request a new one.");
            }
            
            // Mark email as verified
            user.setEmailVerified(true);
            user.setOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(email);
            
            // Prepare response
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("accessToken", token);
            responseData.put("user", userToMap(user));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email verified successfully");
            response.put("data", responseData);
            
            System.out.println("OTP verified for: " + email);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in verifyOtp: " + e.getMessage());
            e.printStackTrace();
            return badRequest("OTP verification failed: " + e.getMessage());
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            System.out.println("=== POST /api/auth/resend-otp ===");
            System.out.println("Email: " + email);
            
            // Find user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Generate new OTP (6 digits)
            String newOtp = String.format("%06d", (int)(Math.random() * 1000000));
            user.setOtp(newOtp);
            user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            
            System.out.println("New OTP for " + email + ": " + newOtp);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP resent successfully. Check your email.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in resendOtp: " + e.getMessage());
            e.printStackTrace();
            return badRequest("Failed to resend OTP: " + e.getMessage());
        }
    }

    // Debug endpoint to enable all users (remove in production)
    @PostMapping("/debug/enable-all-users")
    public ResponseEntity<?> enableAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                user.setEmailVerified(true);
                userRepository.save(user);
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Enabled " + users.size() + " users");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return badRequest("Failed to enable users: " + e.getMessage());
        }
    }

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("firstName", user.getFirstName());
        map.put("lastName", user.getLastName());
        map.put("name", user.getFirstName() + " " + user.getLastName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole().toString());
        map.put("emailVerified", user.isEmailVerified());
        return map;
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}

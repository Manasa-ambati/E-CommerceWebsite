package com.ecommerce.controller;

import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtUtil;
import com.ecommerce.service.EmailService;
import com.ecommerce.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = {
        "http://e-commercewebsite-production-40de.up.railway.app", // Frontend URL
        "http://localhost:3000" // Local development
    },
    allowCredentials = "true"
)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private OtpService otpService;

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

            // Create new user (email verification required via OTP)
            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setPhone(phone);
            user.setRole(User.Role.CUSTOMER);
            user.setEmailVerified(false); // Require OTP verification

            userRepository.save(user);
            System.out.println("✅ User created successfully: " + email);

            // Generate and store OTP in-memory (not in database)
            String otp = String.format("%06d", (int)(Math.random() * 1000000));
            otpService.storeOtp(email, otp, 10); // Store for 10 minutes
            
            // Send OTP via email
            emailService.sendOtpEmail(email, firstName, otp);
            System.out.println("📧 OTP sent to: " + email);

            // Prepare response - don't send token yet, need OTP verification first
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("email", email);
            responseData.put("requiresOtp", true);
            responseData.put("message", "Please verify your email with OTP sent to your registered email");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Signup successful. OTP sent to your email.");
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
            System.out.println("Has password: " + (request.containsKey("password") && !request.get("password").isEmpty()));

            String email = request.get("email");
            String password = request.get("password");

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
            
            User user = existingUser.get();
            
            // Check if password was provided for traditional login
            if (password != null && !password.isEmpty()) {
                System.out.println("🔑 Attempting password-based login for: " + email);
                
                // Verify password
                if (!passwordEncoder.matches(password, user.getPassword())) {
                    return badRequest("Invalid credentials");
                }
                
                // Password verified - generate JWT token directly
                System.out.println("✅ Password verified for: " + email);
                
                // Generate JWT token
                String token = jwtUtil.generateToken(user.getEmail());
                
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("firstName", user.getFirstName());
                userData.put("lastName", user.getLastName());
                userData.put("role", user.getRole().name());
                userData.put("emailVerified", user.isEmailVerified()); // Include email verification status
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("data", userData);
                
                System.out.println("✅ Password login successful for: " + email);
                return ResponseEntity.ok(response);
            }
            
            // No password provided - send OTP for login
            System.out.println("📧 Preparing to send login OTP to: " + user.getEmail());
            
            // Generate and store OTP in database
            String otp = String.format("%06d", (int)(Math.random() * 1000000));
            otpService.storeOtp(email, otp, 10); // Store for 10 minutes
            
            try {
                // Send OTP via email
                emailService.sendOtpEmail(email, user.getFirstName(), otp);
                System.out.println("✅ Login OTP sent to: " + email);
            } catch (Exception emailError) {
                System.err.println("❌ Failed to send email: " + emailError.getMessage());
                emailError.printStackTrace();
                // Continue anyway - user can retry
            }
            
            // Prepare response - ask for OTP
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("email", email);
            responseData.put("requiresOtp", true);
            responseData.put("message", "Please enter OTP sent to your registered email");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP sent successfully to your email");
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
            
            // Verify OTP using in-memory service
            if (!otpService.verifyOtp(email, otp)) {
                return badRequest("Invalid or expired OTP. Please enter correct 6-digit code or request a new one.");
            }
            
            // Mark email as verified (if not already)
            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                userRepository.save(user);
            }
            
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
            
            // Generate new OTP (6 digits) and store in-memory
            String newOtp = String.format("%06d", (int)(Math.random() * 1000000));
            otpService.storeOtp(email, newOtp, 10); // Store for 10 minutes
            
            // Send OTP via email (OTP will NOT be shown in console)
            emailService.sendOtpEmail(email, user.getFirstName(), newOtp);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP resent successfully. Check your registered email.");
            
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
    
    // Debug endpoint to verify a specific user's email (bypass OTP)
    @PostMapping("/debug/verify-user")
    public ResponseEntity<?> verifyUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return badRequest("Email is required");
            }
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (!userOpt.isPresent()) {
                return badRequest("User not found with email: " + email);
            }
            
            User user = userOpt.get();
            user.setEmailVerified(true);
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User " + email + " verified successfully (OTP bypassed)");
            response.put("tip", "You can now login without OTP verification");
            
            System.out.println("🔧 DEBUG: Manually verified user: " + email);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return badRequest("Failed to verify user: " + e.getMessage());
        }
    }
    
    // Debug endpoint: Auto-verify ALL new signups (DEVELOPMENT ONLY!)
    @PostMapping("/debug/auto-verify-all")
    public ResponseEntity<?> autoVerifyAll() {
        try {
            List<User> users = userRepository.findAll();
            int verifiedCount = 0;
            
            for (User user : users) {
                if (!user.isEmailVerified()) {
                    user.setEmailVerified(true);
                    userRepository.save(user);
                    verifiedCount++;
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Auto-verification enabled for all users");
            response.put("verifiedCount", verifiedCount);
            response.put("totalUsers", users.size());
            response.put("warning", "⚠️ This is for DEVELOPMENT only! Remove in production.");
            
            System.out.println("🔧 DEBUG: Auto-verified " + verifiedCount + " users");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return badRequest("Failed to auto-verify users: " + e.getMessage());
        }
    }
    
    // Test email endpoint
    @PostMapping("/debug/test-email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.getOrDefault("name", "Test User");
            
            if (email == null || email.trim().isEmpty()) {
                return badRequest("Email is required");
            }
            
            // Generate test OTP
            String otp = String.format("%06d", (int)(Math.random() * 1000000));
            
            // Send test email
            emailService.sendOtpEmail(email, name, otp);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test email sent! Check console and your inbox.");
            response.put("otp", otp); // Return OTP for testing
            
            System.out.println("\n=== TEST EMAIL INFO ===");
            System.out.println("Recipient: " + email);
            System.out.println("Name: " + name);
            System.out.println("OTP: " + otp);
            System.out.println("========================\n");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in testEmail: " + e.getMessage());
            e.printStackTrace();
            return badRequest("Test email failed: " + e.getMessage());
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

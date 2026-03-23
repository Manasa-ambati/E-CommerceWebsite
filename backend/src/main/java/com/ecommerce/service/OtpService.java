package com.ecommerce.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP storage service.
 * OTPs are stored in memory with automatic expiration - not persisted to database.
 */
@Service
public class OtpService {
    
    // Thread-safe map to store OTPs: email -> OtpData
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    
    /**
     * Store OTP in memory with expiry time.
     */
    public void storeOtp(String email, String otp, int expiryMinutes) {
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusMinutes(expiryMinutes));
        otpStore.put(email, otpData);
        
        // Schedule cleanup after expiry
        scheduleCleanup(email, expiryMinutes);
    }
    
    /**
     * Retrieve OTP for email.
     * Returns null if OTP doesn't exist or is expired.
     */
    public String getOtp(String email) {
        OtpData otpData = otpStore.get(email);
        
        if (otpData == null) {
            return null;
        }
        
        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            otpStore.remove(email);
            return null;
        }
        
        return otpData.otp;
    }
    
    /**
     * Verify OTP for email.
     * Returns true if OTP matches and is not expired.
     */
    public boolean verifyOtp(String email, String otp) {
        String storedOtp = getOtp(email);
        
        if (storedOtp == null) {
            return false;
        }
        
        boolean isValid = storedOtp.equals(otp);
        
        // Remove OTP after verification (one-time use)
        if (isValid) {
            otpStore.remove(email);
        }
        
        return isValid;
    }
    
    /**
     * Remove OTP from storage (used after successful verification).
     */
    public void removeOtp(String email) {
        otpStore.remove(email);
    }
    
    /**
     * Check if OTP exists for email (regardless of validity).
     */
    public boolean hasOtp(String email) {
        return otpStore.containsKey(email);
    }
    
    /**
     * Schedule automatic cleanup of expired OTP.
     */
    private void scheduleCleanup(String email, int delayMinutes) {
        // Use a simple delayed task to clean up expired OTPs
        new Thread(() -> {
            try {
                Thread.sleep(delayMinutes * 60 * 1000L + 1000); // Add 1 second buffer
                OtpData otpData = otpStore.get(email);
                if (otpData != null && LocalDateTime.now().isAfter(otpData.expiryTime)) {
                    otpStore.remove(email);
                    System.out.println("Cleaned up expired OTP for: " + email);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    /**
     * Get count of active OTPs (for monitoring/debugging).
     */
    public int getActiveOtpCount() {
        return (int) otpStore.entrySet().stream()
            .filter(entry -> LocalDateTime.now().isBefore(entry.getValue().expiryTime))
            .count();
    }
    
    /**
     * Clear all OTPs (for testing purposes).
     */
    public void clearAll() {
        otpStore.clear();
    }
    
    /**
     * Internal class to hold OTP data.
     */
    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;
        
        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}

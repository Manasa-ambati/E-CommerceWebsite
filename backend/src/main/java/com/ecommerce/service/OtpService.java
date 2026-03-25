package com.ecommerce.service;

import com.ecommerce.entity.OtpVerification;
import com.ecommerce.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Database-backed OTP storage service.
 * OTPs are stored in database with automatic expiration.
 */
@Service
public class OtpService {
    
    @Autowired
    private OtpVerificationRepository otpRepository;
    
    /**
     * Store OTP in database with expiry time.
     */
    @Transactional
    public void storeOtp(String email, String otp, int expiryMinutes) {
        // Delete existing OTP if any
        otpRepository.deleteByEmail(email);
        
        // Create new OTP entry
        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtp(otp);
        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(expiryMinutes));
        otpVerification.setVerified(false);
        
        otpRepository.save(otpVerification);
        System.out.println("✅ OTP stored in database for: " + email);
    }
    
    /**
     * Retrieve OTP for email.
     * Returns null if OTP doesn't exist or is expired.
     */
    public String getOtp(String email) {
        Optional<OtpVerification> otpOpt = otpRepository.findByEmail(email);
        
        if (!otpOpt.isPresent()) {
            return null;
        }
        
        OtpVerification otpVerification = otpOpt.get();
        
        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(otpVerification.getExpiryTime())) {
            otpRepository.deleteByEmail(email);
            return null;
        }
        
        // Check if already used
        if (otpVerification.isVerified()) {
            return null;
        }
        
        return otpVerification.getOtp();
    }
    
    /**
     * Verify OTP for email.
     * Returns true if OTP matches and is not expired.
     */
    @Transactional
    public boolean verifyOtp(String email, String otp) {
        String storedOtp = getOtp(email);
        
        if (storedOtp == null) {
            return false;
        }
        
        boolean isValid = storedOtp.equals(otp);
        
        // Mark OTP as used after successful verification
        if (isValid) {
            otpRepository.findByEmail(email).ifPresent(otpVerification -> {
                otpVerification.setVerified(true);
                otpVerification.setUsedAt(LocalDateTime.now());
                otpRepository.save(otpVerification);
            });
        }
        
        return isValid;
    }
    
    /**
     * Remove OTP from storage (used after successful verification).
     */
    @Transactional
    public void removeOtp(String email) {
        otpRepository.deleteByEmail(email);
    }
    
    /**
     * Check if OTP exists for email (regardless of validity).
     */
    public boolean hasOtp(String email) {
        return otpRepository.existsByEmail(email);
    }
    
    /**
     * Get count of active OTPs (for monitoring/debugging).
     */
    public int getActiveOtpCount() {
        return (int) otpRepository.findAll().stream()
            .filter(otp -> !otp.isVerified() && LocalDateTime.now().isBefore(otp.getExpiryTime()))
            .count();
    }
    
    /**
     * Clear all OTPs (for testing purposes).
     */
    @Transactional
    public void clearAll() {
        otpRepository.deleteAll();
    }
}

package com.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendOtpEmail(String toEmail, String firstName, String otp) {
        // Print OTP to console for development/testing
        System.out.println("\n========================================");
        System.out.println("OTP for " + firstName + " (" + toEmail + "): " + otp);
        System.out.println("========================================\n");
        
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setTo(toEmail);
        message.setSubject("Welcome to E-Commerce - Email Verification");
        message.setFrom("manasaambati244@gmail.com");
        
        String emailContent = String.format(
            "Dear %s,\n\n" +
            "Welcome to our E-Commerce platform!\n\n" +
            "Your One-Time Password (OTP) for email verification is:\n\n" +
            "** %s **\n\n" +
            "This OTP is valid for 10 minutes.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Best regards,\n" +
            "E-Commerce Team",
            firstName,
            otp
        );
        
        message.setText(emailContent);
        
        try {
            mailSender.send(message);
            System.out.println("OTP email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            System.err.println("\nYou can still use the OTP from the console above!");
            // Don't throw exception - allow testing without email configuration
        }
    }
}

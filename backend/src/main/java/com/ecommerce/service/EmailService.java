package com.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendOtpEmail(String toEmail, String firstName, String otp) {
        System.out.println("\n📧 Sending OTP email to: " + firstName + " <" + toEmail + ">");
        
        // Check if mail configuration is present
        if (mailSender == null) {
            System.err.println("⚠️  MailSender not configured - skipping email send");
            System.err.println("💡 To enable email, add these Railway environment variables:");
            System.err.println("   SPRING_MAIL_USERNAME=your-email@gmail.com");
            System.err.println("   SPRING_MAIL_PASSWORD=your-app-password");
            System.err.println("\n📝 For development/testing, you can manually verify users in database:");
            System.err.println("   UPDATE user SET email_verified = true WHERE email = '" + toEmail + "';");
            return;
        }
        
        try {
            // Create MIME message for better HTML formatting
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject("Welcome to ShopEase - Email Verification OTP");
            helper.setFrom("manasaambati244@gmail.com", "ShopEase Team");
            
            // HTML email content with better formatting
            String htmlContent = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <style>" +
                "    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                "    .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                "    .header { background: linear-gradient(135deg, #f97316 0%%, #ec4899 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                "    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                "    .otp-box { background: white; border: 3px solid #f97316; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }" +
                "    .otp-code { font-size: 36px; font-weight: bold; color: #f97316; letter-spacing: 5px; }" +
                "    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>🛒 ShopEase</h1>" +
                "      <p>Your One-Stop Shopping Destination</p>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <h2>Hello %s!</h2>" +
                "      <p>Welcome to ShopEase! We're excited to have you on board.</p>" +
                "      <p>To complete your verification, please use the following One-Time Password (OTP):</p>" +
                "      <div class='otp-box'>" +
                "        <p style='margin: 0; color: #666; font-size: 14px;'>Your Verification Code:</p>" +
                "        <div class='otp-code'>%s</div>" +
                "        <p style='margin: 10px 0 0 0; color: #999; font-size: 12px;'>Valid for 10 minutes</p>" +
                "      </div>" +
                "      <p><strong>Important:</strong> This OTP is valid for only 10 minutes and can be used only once.</p>" +
                "      <p>If you didn't request this verification, please ignore this email or contact our support team.</p>" +
                "      <p>Happy Shopping! 🎉</p>" +
                "      <div class='footer'>" +
                "        <p>&copy; 2026 ShopEase. All rights reserved.</p>" +
                "        <p>This is an automated message, please do not reply.</p>" +
                "      </div>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>",
                firstName,
                otp
            );
            
            helper.setText(htmlContent, true); // true = HTML
            
            // Send email
            mailSender.send(message);
            
            System.out.println("✅ OTP email SENT SUCCESSFULLY to: " + toEmail);
            System.out.println("📬 Please check inbox (and spam folder)\n");
            
        } catch (MessagingException e) {
            System.err.println("❌ EMAIL FAILED - MessagingException for: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            System.err.println("\n⚠️  TROUBLESHOOTING:");
            System.err.println("1. Check Gmail App Password (NOT regular password)");
            System.err.println("2. Generate at: https://myaccount.google.com/apppasswords");
            System.err.println("3. Ensure 2-Step Verification is enabled");
            System.err.println("4. Current password in config: dyofqxocwcgzpcwk");
            System.err.println("\n📝 For testing, you can disable email verification:\n   - Set user.email_verified=true in database\n");
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ EMAIL FAILED - Exception for: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

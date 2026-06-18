package com.scholarship.scholarshipportal.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email notification service with actual SMTP support
 * Supports both real email sending and fallback logging
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@scholarshipportal.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    /**
     * Send email for application approval
     */
    public void sendApplicationApprovedEmail(String toEmail, String studentName, String scholarshipTitle) {
        String subject = "Scholarship Application Approved";
        String body = String.format(
            "Dear %s,\n\nCongratulations! Your application for '%s' has been APPROVED.\n\n" +
            "Best regards,\nScholarship Portal Team",
            studentName, scholarshipTitle
        );
        sendEmail(toEmail, subject, body);
    }

    /**
     * Send email for application rejection
     */
    public void sendApplicationRejectedEmail(String toEmail, String studentName, String scholarshipTitle) {
        String subject = "Scholarship Application Status Update";
        String body = String.format(
            "Dear %s,\n\nWe regret to inform you that your application for '%s' was not approved at this time.\n\n" +
            "Best regards,\nScholarship Portal Team",
            studentName, scholarshipTitle
        );
        sendEmail(toEmail, subject, body);
    }

    /**
     * Send welcome email for new users
     */
    public void sendWelcomeEmail(String toEmail, String username) {
        String subject = "Welcome to Scholarship Portal";
        String body = String.format(
            "Dear %s,\n\nWelcome to our Scholarship Management System! Your account has been created successfully.\n\n" +
            "You can now start exploring scholarship opportunities.\n\n" +
            "Best regards,\nScholarship Portal Team",
            username
        );
        sendEmail(toEmail, subject, body);
    }

    /**
     * Send scholarship deadline reminder
     */
    public void sendDeadlineReminderEmail(String toEmail, String scholarshipTitle, String deadline) {
        String subject = "Scholarship Deadline Reminder";
        String body = String.format(
            "Reminder: The application deadline for '%s' is %s.\n\nDon't miss this opportunity - Apply now!\n\n" +
            "Best regards,\nScholarship Portal Team",
            scholarshipTitle, deadline
        );
        sendEmail(toEmail, subject, body);
    }

    /**
     * Send eligibility alert for matching scholarships
     */
    public void sendEligibilityAlertEmail(String toEmail,
                                          String studentName,
                                          String scholarshipTitle,
                                          String deadline,
                                          String applicationLink) {
        String subject = "New Eligible Scholarship Opportunity";
        StringBuilder body = new StringBuilder();
        body.append(String.format("Dear %s,\n\n", studentName));
        body.append(String.format("Good news! You are eligible for '%s'.\n", scholarshipTitle));
        body.append(String.format("Application Deadline: %s\n\n", deadline));
        
        if (applicationLink != null && !applicationLink.isBlank()) {
            body.append(String.format("Apply Now: %s\n\n", applicationLink));
        }
        
        body.append("Start your application today to secure this opportunity!\n\n");
        body.append("Best regards,\nScholarship Portal Team");
        
        sendEmail(toEmail, subject, body.toString());
    }

    /**
     * Core method to send emails
     * Falls back to logging if email is not configured or disabled
     */
    private void sendEmail(String toEmail, String subject, String body) {
        if (!emailEnabled || mailSender == null) {
            // Fallback to logging when email is disabled or not configured
            logger.info("=== EMAIL NOTIFICATION (LOGGING MODE) ===");
            logger.info("To: {}", toEmail);
            logger.info("Subject: {}", subject);
            logger.info("Body:\n{}", body);
            logger.info("==========================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            logger.info("Email sent successfully to: {} with subject: {}", toEmail, subject);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}. Error: {}", toEmail, e.getMessage(), e);
            // Log the email content anyway for debugging
            logger.info("=== EMAIL CONTENT (FAILED DELIVERY) ===");
            logger.info("To: {}", toEmail);
            logger.info("Subject: {}", subject);
            logger.info("Body:\n{}", body);
            logger.info("=======================================");
        }
    }
}

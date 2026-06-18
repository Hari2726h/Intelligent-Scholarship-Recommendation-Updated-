package com.scholarship.scholarshipportal.consumer;

import com.scholarship.scholarshipportal.config.KafkaConfig;
import com.scholarship.scholarshipportal.event.*;
import com.scholarship.scholarshipportal.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka Consumer for processing email notifications.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Email sending is inherently slow (SMTP handshake, DNS lookups, retries).
 * A single email can take 1-5 seconds. If done synchronously in the API call:
 * - Application submission: 50ms (DB) + 3000ms (email) = 3050ms response time
 * - With Kafka: 50ms (DB) + 5ms (Kafka publish) = 55ms response time
 *
 * The email is sent asynchronously by this consumer, typically within seconds
 * of the event being published.
 *
 * WHY A SEPARATE CONSUMER FROM NotificationConsumer?
 * In-app notifications and emails have different failure modes:
 * - Notification save: Fast, reliable (local DB)
 * - Email send: Slow, unreliable (external SMTP server)
 *
 * If they shared a consumer, a slow email would block notification processing.
 * Separate consumers = independent scaling and failure isolation.
 *
 * DESIGN PATTERN: Single Responsibility Principle
 * - Each consumer handles exactly one concern
 *
 * KAFKA CONCEPTS:
 * - groupId: "email-consumer-group" (different from notification-consumer-group)
 * - Both consumer groups receive ALL messages on the topic independently
 * - This is the Pub/Sub model: one event, multiple consumers
 *
 * INTERVIEW QUESTIONS:
 * 1. Why different consumer groups? → Each group gets its own copy of every message.
 *    notification-consumer-group creates in-app notifications.
 *    email-consumer-group sends emails.
 *    Both process the same events independently.
 * 2. What if the email server is down? → Kafka retries 3 times (configured in KafkaConfig).
 *    After that, the message goes to DLT for manual inspection.
 * 3. How do you prevent duplicate emails? → Track sent emails by eventId in a database
 *    table. Before sending, check if this eventId was already processed.
 */
@Component
public class EmailConsumer {

    private static final Logger logger = LoggerFactory.getLogger(EmailConsumer.class);

    private final EmailService emailService;

    public EmailConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Listens to notification-events topic for email-worthy events.
     *
     * Uses a DIFFERENT groupId than NotificationConsumer, so both consumers
     * receive all messages independently (fan-out pattern).
     */
    @KafkaListener(
            topics = KafkaConfig.TOPIC_NOTIFICATION_EVENTS,
            groupId = "email-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleEmailEvent(Object event) {
        try {
            if (event instanceof ApplicationApprovedEvent approved) {
                handleApprovalEmail(approved);
            } else if (event instanceof ApplicationRejectedEvent rejected) {
                handleRejectionEmail(rejected);
            } else if (event instanceof UserRegisteredEvent registered) {
                handleWelcomeEmail(registered);
            } else {
                logger.debug("Email consumer ignoring event type: {}",
                        event.getClass().getSimpleName());
            }
        } catch (Exception e) {
            logger.error("Error processing email event: {}", e.getMessage(), e);
            throw e; // Re-throw for Kafka retry
        }
    }

    private void handleApprovalEmail(ApplicationApprovedEvent event) {
        logger.info("Sending approval email: student={}, scholarship={}",
                event.getStudentName(), event.getScholarshipTitle());

        emailService.sendApplicationApprovedEmail(
                event.getStudentEmail(),
                event.getStudentName(),
                event.getScholarshipTitle()
        );

        logger.info("Approval email sent to: {}", event.getStudentEmail());
    }

    private void handleRejectionEmail(ApplicationRejectedEvent event) {
        logger.info("Sending rejection email: student={}, scholarship={}",
                event.getStudentName(), event.getScholarshipTitle());

        emailService.sendApplicationRejectedEmail(
                event.getStudentEmail(),
                event.getStudentName(),
                event.getScholarshipTitle()
        );

        logger.info("Rejection email sent to: {}", event.getStudentEmail());
    }

    private void handleWelcomeEmail(UserRegisteredEvent event) {
        logger.info("Sending welcome email: user={}", event.getUsername());

        emailService.sendWelcomeEmail(
                event.getEmail(),
                event.getUsername()
        );

        logger.info("Welcome email sent to: {}", event.getEmail());
    }
}

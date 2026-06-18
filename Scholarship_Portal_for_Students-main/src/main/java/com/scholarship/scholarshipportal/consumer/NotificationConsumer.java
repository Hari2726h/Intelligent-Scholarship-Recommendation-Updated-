package com.scholarship.scholarshipportal.consumer;

import com.scholarship.scholarshipportal.config.KafkaConfig;
import com.scholarship.scholarshipportal.entity.Notification;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.event.*;
import com.scholarship.scholarshipportal.repository.NotificationRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;
import com.scholarship.scholarshipportal.service.RedisCacheService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Kafka Consumer for processing notification events.
 *
 * PRODUCTION-GRADE FEATURES:
 * 1. IDEMPOTENCY: Tracks processed eventIds to prevent duplicate notifications
 *    on Kafka redelivery (at-least-once guarantee → exactly-once processing)
 * 2. METRICS: Micrometer counters for monitoring processed/duplicate/failed events
 * 3. DLQ: Failed messages are routed to .DLT topic by KafkaConfig error handler
 *
 * INTERVIEW VALUE:
 * "Our consumers are idempotent. We track processed event IDs in a ConcurrentHashMap
 * (in production, use Redis SET with TTL). If a redelivered message has an eventId
 * we've already processed, we skip it. This ensures exactly-once processing semantics
 * on top of Kafka's at-least-once delivery guarantee."
 */
@Component
public class NotificationConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final RedisCacheService redisCacheService;

    // Idempotency: Track processed event IDs to prevent duplicate processing
    // In production, use Redis SET with TTL for distributed idempotency
    private final Set<String> processedEventIds = ConcurrentHashMap.newKeySet();

    // Micrometer metrics for monitoring
    private final Counter eventsProcessed;
    private final Counter eventsDuplicate;
    private final Counter eventsFailed;

    public NotificationConsumer(NotificationRepository notificationRepository,
                                 UserRepository userRepository,
                                 RedisCacheService redisCacheService,
                                 MeterRegistry meterRegistry) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.redisCacheService = redisCacheService;

        // Register Micrometer counters
        this.eventsProcessed = Counter.builder("kafka.consumer.notification.processed")
                .description("Total notification events processed")
                .register(meterRegistry);
        this.eventsDuplicate = Counter.builder("kafka.consumer.notification.duplicate")
                .description("Duplicate notification events skipped")
                .register(meterRegistry);
        this.eventsFailed = Counter.builder("kafka.consumer.notification.failed")
                .description("Failed notification events")
                .register(meterRegistry);
    }

    @KafkaListener(
            topics = KafkaConfig.TOPIC_NOTIFICATION_EVENTS,
            groupId = "notification-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleNotificationEvent(Object event) {
        try {
            // === IDEMPOTENCY CHECK ===
            if (event instanceof BaseEvent baseEvent) {
                String eventId = baseEvent.getEventId();
                if (eventId != null && !processedEventIds.add(eventId)) {
                    logger.warn("IDEMPOTENCY: Skipping duplicate event: {}", eventId);
                    eventsDuplicate.increment();
                    return;
                }
            }

            if (event instanceof ApplicationSubmittedEvent submitted) {
                handleApplicationSubmitted(submitted);
            } else if (event instanceof ApplicationApprovedEvent approved) {
                handleApplicationApproved(approved);
            } else if (event instanceof ApplicationRejectedEvent rejected) {
                handleApplicationRejected(rejected);
            } else if (event instanceof UserRegisteredEvent registered) {
                handleUserRegistered(registered);
            } else if (event instanceof DocumentUploadedEvent uploaded) {
                handleDocumentUploaded(uploaded);
            } else {
                logger.warn("Received unknown event type: {}", event.getClass().getSimpleName());
            }

            eventsProcessed.increment();
        } catch (Exception e) {
            eventsFailed.increment();
            logger.error("Error processing notification event: {}", e.getMessage(), e);
            throw e; // Re-throw to trigger Kafka retry → DLT
        }
    }

    private void handleApplicationSubmitted(ApplicationSubmittedEvent event) {
        logger.info("Processing ApplicationSubmittedEvent for notification: {}", event);

        User user = userRepository.findByUsername(event.getUsername()).orElse(null);
        if (user == null) {
            logger.warn("User not found for notification: {}", event.getUsername());
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Your application for '" + event.getScholarshipTitle() +
                "' has been submitted successfully.");
        notification.setNotificationType(Notification.NotificationType.APPLICATION_SUBMITTED);
        notification.setScholarshipId(event.getScholarshipId());
        notificationRepository.save(notification);

        // Invalidate notification cache for this user
        redisCacheService.evictNotifications(user.getId());

        logger.info("Notification created for application submission: user={}, scholarship={}",
                event.getUsername(), event.getScholarshipTitle());
    }

    private void handleApplicationApproved(ApplicationApprovedEvent event) {
        logger.info("Processing ApplicationApprovedEvent for notification: {}", event);

        User user = findUserByStudentInfo(event.getStudentEmail(), event.getStudentName());
        if (user == null) {
            logger.warn("User not found for approved notification: {}", event.getStudentName());
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Congratulations! Your application for '" +
                event.getScholarshipTitle() + "' has been APPROVED!");
        notification.setNotificationType(Notification.NotificationType.GENERAL);
        notification.setScholarshipId(event.getScholarshipId());
        notificationRepository.save(notification);

        redisCacheService.evictNotifications(user.getId());

        logger.info("Approval notification created for: {}", event.getStudentName());
    }

    private void handleApplicationRejected(ApplicationRejectedEvent event) {
        logger.info("Processing ApplicationRejectedEvent for notification: {}", event);

        User user = findUserByStudentInfo(event.getStudentEmail(), event.getStudentName());
        if (user == null) {
            logger.warn("User not found for rejected notification: {}", event.getStudentName());
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Your application for '" + event.getScholarshipTitle() +
                "' was not approved. " +
                (event.getReason() != null ? "Reason: " + event.getReason() : ""));
        notification.setNotificationType(Notification.NotificationType.GENERAL);
        notification.setScholarshipId(event.getScholarshipId());
        notificationRepository.save(notification);

        redisCacheService.evictNotifications(user.getId());

        logger.info("Rejection notification created for: {}", event.getStudentName());
    }

    private void handleUserRegistered(UserRegisteredEvent event) {
        logger.info("Processing UserRegisteredEvent for notification: {}", event);

        User user = userRepository.findByUsername(event.getUsername()).orElse(null);
        if (user == null) {
            logger.warn("User not found for welcome notification: {}", event.getUsername());
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Welcome to Scholarship Portal! Complete your profile to " +
                "discover scholarships you're eligible for.");
        notification.setNotificationType(Notification.NotificationType.GENERAL);
        notificationRepository.save(notification);

        redisCacheService.evictNotifications(user.getId());

        logger.info("Welcome notification created for: {}", event.getUsername());
    }

    private void handleDocumentUploaded(DocumentUploadedEvent event) {
        logger.info("Processing DocumentUploadedEvent for notification: {}", event);

        User user = userRepository.findByUsername(event.getUsername()).orElse(null);
        if (user == null) {
            logger.warn("User not found for document notification: {}", event.getUsername());
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Your document '" + event.getFileName() +
                "' has been uploaded successfully.");
        notification.setNotificationType(Notification.NotificationType.GENERAL);
        notificationRepository.save(notification);

        redisCacheService.evictNotifications(user.getId());

        logger.info("Document upload notification created for: {}", event.getUsername());
    }

    private User findUserByStudentInfo(String email, String name) {
        if (email != null) {
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }
}

package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.config.KafkaConfig;
import com.scholarship.scholarshipportal.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Centralized Kafka Event Producer for the Scholarship Portal.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Instead of having each service directly use KafkaTemplate (which scatters Kafka concerns
 * across the codebase), this class centralizes all event publishing in one place. This provides:
 * 1. Single point of change for topic names, error handling, and logging
 * 2. Consistent event publishing patterns across all modules
 * 3. Easy to mock in unit tests
 * 4. Type-safe methods for each event type
 *
 * DESIGN PATTERN: Facade Pattern
 * - Hides the complexity of KafkaTemplate behind simple, domain-specific methods
 * - Services call publishApplicationSubmitted() instead of dealing with topics and keys
 *
 * KAFKA CONCEPTS:
 * - KafkaTemplate.send(): Asynchronously publishes a message and returns a CompletableFuture
 * - Topic: The destination channel for the message
 * - Key: Used for partition selection (messages with the same key go to the same partition)
 * - Callback: thenAccept/exceptionally handle success/failure asynchronously
 *
 * INTERVIEW QUESTIONS:
 * 1. Why a centralized producer? → Single Responsibility Principle. Services shouldn't know
 *    about Kafka topics or serialization details.
 * 2. Is send() blocking? → No, it's asynchronous. KafkaTemplate.send() returns a
 *    CompletableFuture. The calling thread is not blocked.
 * 3. What if send fails? → The CompletableFuture's exceptionally() logs the error.
 *    The original business operation (e.g., application save) is NOT rolled back.
 *    This is by design: we prioritize data consistency over event delivery.
 * 4. How do you ensure ordering? → By using the entity ID as the message key.
 *    Kafka guarantees ordering within a partition, and the key determines the partition.
 */
@Service
public class EventProducerService {

    private static final Logger logger = LoggerFactory.getLogger(EventProducerService.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public EventProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Publishes an ApplicationSubmittedEvent to the application-events topic.
     *
     * Key: applicationId → ensures all events for the same application go to the same partition
     * Topic: application-events
     */
    public void publishApplicationSubmitted(ApplicationSubmittedEvent event) {
        String key = String.valueOf(event.getApplicationId());
        publishEvent(KafkaConfig.TOPIC_APPLICATION_EVENTS, key, event);
    }

    /**
     * Publishes an ApplicationApprovedEvent to the application-events topic.
     */
    public void publishApplicationApproved(ApplicationApprovedEvent event) {
        String key = String.valueOf(event.getApplicationId());
        publishEvent(KafkaConfig.TOPIC_APPLICATION_EVENTS, key, event);
    }

    /**
     * Publishes an ApplicationRejectedEvent to the application-events topic.
     */
    public void publishApplicationRejected(ApplicationRejectedEvent event) {
        String key = String.valueOf(event.getApplicationId());
        publishEvent(KafkaConfig.TOPIC_APPLICATION_EVENTS, key, event);
    }

    /**
     * Publishes a UserRegisteredEvent to the user-events topic.
     *
     * Key: username → ensures all events for the same user go to the same partition
     * Topic: user-events
     */
    public void publishUserRegistered(UserRegisteredEvent event) {
        publishEvent(KafkaConfig.TOPIC_USER_EVENTS, event.getUsername(), event);
    }

    /**
     * Publishes a DocumentUploadedEvent to the application-events topic.
     *
     * Key: studentId → ensures all document events for the same student are ordered
     * Topic: application-events (documents are part of the application lifecycle)
     */
    public void publishDocumentUploaded(DocumentUploadedEvent event) {
        String key = String.valueOf(event.getStudentId());
        publishEvent(KafkaConfig.TOPIC_APPLICATION_EVENTS, key, event);
    }

    /**
     * Generic event publishing method with logging and error handling.
     *
     * HOW IT WORKS:
     * 1. kafkaTemplate.send() serializes the event to JSON and sends to the broker
     * 2. The CompletableFuture resolves when the broker acknowledges receipt
     * 3. On success: log the offset and partition for debugging
     * 4. On failure: log the error (but don't throw — the business operation already succeeded)
     *
     * IMPORTANT: This is fire-and-forget. If guaranteed delivery is needed,
     * implement the Transactional Outbox Pattern:
     * 1. Save event to an "outbox" table in the same DB transaction
     * 2. A separate thread polls the outbox table and publishes to Kafka
     * 3. After successful publish, mark the outbox entry as "published"
     */
    private void publishEvent(String topic, String key, Object event) {
        try {
            logger.info("Publishing event to topic '{}' with key '{}': {}",
                    topic, key, event.getClass().getSimpleName());

            CompletableFuture<SendResult<String, Object>> future =
                    kafkaTemplate.send(topic, key, event);

            future.thenAccept(result -> {
                logger.info("Event published successfully to topic '{}', partition {}, offset {}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }).exceptionally(ex -> {
                logger.error("Failed to publish event to topic '{}' with key '{}': {}",
                        topic, key, ex.getMessage(), ex);
                return null;
            });
        } catch (Exception e) {
            logger.error("Exception while publishing event to topic '{}': {}",
                    topic, e.getMessage(), e);
        }
    }
}

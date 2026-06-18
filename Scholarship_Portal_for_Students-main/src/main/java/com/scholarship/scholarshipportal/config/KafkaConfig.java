package com.scholarship.scholarshipportal.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Configuration for the Scholarship Portal Event-Driven Architecture.
 *
 * WHY THIS EXISTS:
 * ----------------
 * The existing system performs operations synchronously: when a student applies for a scholarship,
 * the same thread creates the application, saves audit logs, sends emails, generates notifications,
 * and updates analytics. This creates tight coupling and makes the request slower.
 *
 * With Kafka, we decouple these concerns:
 * - The API endpoint publishes an "ApplicationSubmittedEvent" to Kafka and returns immediately.
 * - Separate consumers handle notifications, emails, audit logs, and analytics asynchronously.
 * - If a consumer fails, Kafka retries with backoff. If it keeps failing, the message goes to a
 *   Dead Letter Topic for manual inspection.
 *
 * DESIGN PATTERN: Event-Driven Architecture + Pub/Sub Pattern
 *
 * KAFKA CONCEPTS:
 * - Producer: Publishes events to topics (fire-and-forget or with acknowledgement)
 * - Consumer: Subscribes to topics and processes events
 * - Topic: A named feed of messages, partitioned for parallelism
 * - Consumer Group: Ensures each message is processed by exactly one consumer in the group
 * - Partition: A topic is split into partitions for parallel processing
 * - Offset: The position of a consumer in a partition (Kafka tracks this)
 * - Dead Letter Queue (DLQ): A topic where failed messages are sent after exhausting retries
 *
 * INTERVIEW QUESTIONS:
 * 1. Why Kafka over RabbitMQ? → Kafka is designed for high-throughput, persistent event streams.
 *    It retains messages (configurable retention), supports replay, and scales horizontally.
 * 2. What is a Consumer Group? → A group of consumers that share the work of processing a topic.
 *    Each partition is assigned to exactly one consumer in the group.
 * 3. What is a Dead Letter Queue? → When a message fails processing after all retries, it's
 *    published to a separate topic (DLQ) for investigation rather than being lost.
 * 4. What happens if a consumer crashes mid-processing? → Kafka tracks offsets. If auto-commit
 *    is enabled, the offset might be committed before processing completes (at-most-once).
 *    With manual commit, the message will be re-delivered (at-least-once).
 * 5. Why JSON serialization? → Human-readable, language-agnostic, debuggable. Schema Registry
 *    with Avro is used in larger systems for stricter contracts.
 */
@Configuration
@EnableKafka
public class KafkaConfig {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConfig.class);

    // Topic names as constants for type safety
    public static final String TOPIC_APPLICATION_EVENTS = "application-events";
    public static final String TOPIC_USER_EVENTS = "user-events";
    public static final String TOPIC_NOTIFICATION_EVENTS = "notification-events";
    public static final String TOPIC_AUDIT_EVENTS = "audit-events";

    // Dead Letter Topics
    public static final String DLT_APPLICATION_EVENTS = "application-events.DLT";
    public static final String DLT_NOTIFICATION_EVENTS = "notification-events.DLT";

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:scholarship-portal-group}")
    private String groupId;

    // ==================== TOPIC CREATION ====================

    /**
     * Creates Kafka topics programmatically on application startup.
     * Partitions = 3 for parallelism; Replicas = 1 for local dev (use 3 in production).
     */
    @Bean
    public NewTopic applicationEventsTopic() {
        return TopicBuilder.name(TOPIC_APPLICATION_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userEventsTopic() {
        return TopicBuilder.name(TOPIC_USER_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic notificationEventsTopic() {
        return TopicBuilder.name(TOPIC_NOTIFICATION_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic auditEventsTopic() {
        return TopicBuilder.name(TOPIC_AUDIT_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic applicationEventsDltTopic() {
        return TopicBuilder.name(DLT_APPLICATION_EVENTS)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic notificationEventsDltTopic() {
        return TopicBuilder.name(DLT_NOTIFICATION_EVENTS)
                .partitions(1)
                .replicas(1)
                .build();
    }

    // ==================== PRODUCER CONFIGURATION ====================

    /**
     * ProducerFactory configures how messages are serialized and sent to Kafka.
     *
     * HOW IT WORKS:
     * 1. bootstrap.servers: Kafka broker addresses for initial cluster discovery
     * 2. key.serializer: StringSerializer for message keys (used for partitioning)
     * 3. value.serializer: JsonSerializer for message payloads (event objects)
     * 4. acks=all: Wait for all in-sync replicas to acknowledge (strongest durability)
     * 5. retries=3: Retry up to 3 times on transient failures
     * 6. enable.idempotence=true: Ensures exactly-once delivery semantics
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);

        logger.info("Kafka ProducerFactory configured with bootstrap servers: {}", bootstrapServers);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * KafkaTemplate is the high-level API for sending messages.
     * It wraps ProducerFactory and provides send(), sendDefault(), etc.
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // ==================== CONSUMER CONFIGURATION ====================

    /**
     * ConsumerFactory configures how messages are deserialized and consumed.
     *
     * HOW IT WORKS:
     * 1. group.id: Consumers with the same group ID share the load of processing a topic
     * 2. auto.offset.reset=earliest: Start from the beginning if no committed offset exists
     * 3. JsonDeserializer with trusted packages: Only deserialize classes from our package
     * 4. enable.auto.commit=true: Offsets are committed automatically after processing
     */
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "com.scholarship.scholarshipportal.*");
        configProps.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, true);

        logger.info("Kafka ConsumerFactory configured with group: {}", groupId);
        return new DefaultKafkaConsumerFactory<>(configProps);
    }

    /**
     * ConcurrentKafkaListenerContainerFactory creates listener containers for @KafkaListener.
     *
     * HOW IT WORKS:
     * 1. setConcurrency(3): Creates 3 consumer threads per listener for parallelism
     * 2. CommonErrorHandler: Configures retry behavior on consumer exceptions
     * 3. FixedBackOff(1000, 3): Retry 3 times with 1 second delay between retries
     * 4. After 3 retries fail, the message is logged and discarded (or sent to DLT)
     *
     * RETRY STRATEGY:
     * Attempt 1 → fails → wait 1s → Attempt 2 → fails → wait 1s → Attempt 3 → fails → DLT
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3);
        factory.setCommonErrorHandler(kafkaErrorHandler());

        logger.info("Kafka listener container factory configured with concurrency=3");
        return factory;
    }

    /**
     * Error handler with retry and Dead Letter Queue behavior.
     *
     * FixedBackOff(intervalMs, maxAttempts):
     * - interval: 1000ms between retries
     * - maxAttempts: 3 retries before giving up
     *
     * PRODUCTION-GRADE: Uses DeadLetterPublishingRecoverer to route failed messages
     * to the corresponding .DLT topic after exhausting retries.
     *
     * INTERVIEW VALUE: "We use DLQ with DeadLetterPublishingRecoverer. After 3 retries
     * with 1s backoff, failed messages go to topic-name.DLT for manual inspection.
     * This prevents poison pills from blocking the consumer."
     */
    @Bean
    public CommonErrorHandler kafkaErrorHandler() {
        // DeadLetterPublishingRecoverer sends failed messages to .DLT topics
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
                kafkaTemplate(),
                (ConsumerRecord<?, ?> record, Exception ex) -> {
                    // Route to the corresponding DLT topic
                    String dlqTopic = record.topic() + ".DLT";
                    logger.error("Sending failed message to DLT: topic={}, key={}, error={}",
                            dlqTopic, record.key(), ex.getMessage());
                    return new TopicPartition(dlqTopic, -1); // -1 = let Kafka choose partition
                }
        );

        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                recoverer,
                new FixedBackOff(1000L, 3L) // 3 retries, 1s interval
        );

        // Don't retry on deserialization errors (they'll never succeed)
        errorHandler.addNotRetryableExceptions(
                org.apache.kafka.common.errors.SerializationException.class,
                ClassCastException.class
        );

        logger.info("Kafka error handler configured: 3 retries → 1s backoff → DLT");
        return errorHandler;
    }
}


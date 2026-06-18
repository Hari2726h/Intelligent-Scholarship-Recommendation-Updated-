package com.scholarship.scholarshipportal.consumer;

import com.scholarship.scholarshipportal.config.KafkaConfig;
import com.scholarship.scholarshipportal.event.*;
import com.scholarship.scholarshipportal.service.RedisCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka Consumer for analytics cache invalidation.
 *
 * WHY THIS EXISTS:
 * ----------------
 * The analytics dashboard shows aggregated data (total users, applications, approval rates).
 * This data is cached in Redis (analytics:dashboard key) with a 5-minute TTL.
 *
 * When significant events occur (new application, approval, new user), the cached analytics
 * become stale. This consumer listens for these events and invalidates the cache, forcing
 * the next dashboard request to fetch fresh data from the database.
 *
 * WITHOUT this consumer, admins would see stale data for up to 5 minutes after changes.
 * WITH this consumer, the cache is invalidated immediately, and the next request loads fresh data.
 *
 * DESIGN PATTERN: Observer Pattern + Cache Invalidation
 * - Observes domain events to trigger cache eviction
 * - Follows the "eventual freshness" model
 *
 * KAFKA CONCEPTS:
 * - This consumer has its own group ID ("analytics-consumer-group")
 * - It processes events independently from notification and email consumers
 * - It listens to application-events topic (where application lifecycle events are published)
 *
 * INTERVIEW QUESTIONS:
 * 1. Why not just set a short TTL? → A 1-second TTL would eliminate staleness but also
 *    eliminate the caching benefit. Event-driven invalidation gives you both: long cache
 *    lifetime AND immediate freshness when data changes.
 * 2. Could this cause a cache stampede? → Yes, if many events arrive simultaneously and
 *    all invalidate the cache. Mitigation: use a "coalescing invalidation" where multiple
 *    invalidation requests within a window are batched into one.
 * 3. Why not update the cache instead of invalidating? → Updating requires the consumer
 *    to know the full analytics computation logic. Invalidation is simpler and ensures
 *    the next request gets authoritative data from the database.
 */
@Component
public class AnalyticsConsumer {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsConsumer.class);

    private final RedisCacheService redisCacheService;

    public AnalyticsConsumer(RedisCacheService redisCacheService) {
        this.redisCacheService = redisCacheService;
    }

    /**
     * Listens to application-events topic for analytics-impacting events.
     *
     * Every application submission, approval, or rejection changes the analytics numbers.
     * This consumer invalidates the analytics cache so the dashboard shows fresh data.
     */
    @KafkaListener(
            topics = KafkaConfig.TOPIC_APPLICATION_EVENTS,
            groupId = "analytics-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleApplicationEvent(Object event) {
        try {
            if (event instanceof ApplicationSubmittedEvent submitted) {
                logger.info("Analytics: New application submitted for '{}' by {}",
                        submitted.getScholarshipTitle(), submitted.getUsername());
                redisCacheService.evictAnalytics();
                logger.info("Analytics cache invalidated due to new application");

            } else if (event instanceof ApplicationApprovedEvent approved) {
                logger.info("Analytics: Application approved for '{}' by {}",
                        approved.getScholarshipTitle(), approved.getApprovedBy());
                redisCacheService.evictAnalytics();
                logger.info("Analytics cache invalidated due to application approval");

            } else if (event instanceof ApplicationRejectedEvent rejected) {
                logger.info("Analytics: Application rejected for '{}' by {}",
                        rejected.getScholarshipTitle(), rejected.getRejectedBy());
                redisCacheService.evictAnalytics();
                logger.info("Analytics cache invalidated due to application rejection");

            } else if (event instanceof DocumentUploadedEvent uploaded) {
                logger.debug("Analytics: Document uploaded by {} (no cache impact)",
                        uploaded.getUsername());
            }
        } catch (Exception e) {
            logger.error("Error processing analytics event: {}", e.getMessage(), e);
            // Don't re-throw: analytics cache invalidation is not critical.
            // The cache will expire naturally via TTL.
        }
    }

    /**
     * Listens to user-events for user count changes.
     */
    @KafkaListener(
            topics = KafkaConfig.TOPIC_USER_EVENTS,
            groupId = "analytics-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleUserEvent(Object event) {
        try {
            if (event instanceof UserRegisteredEvent registered) {
                logger.info("Analytics: New user registered - {}", registered.getUsername());
                redisCacheService.evictAnalytics();
                logger.info("Analytics cache invalidated due to new user registration");
            }
        } catch (Exception e) {
            logger.error("Error processing user event for analytics: {}", e.getMessage(), e);
        }
    }
}

package com.scholarship.scholarshipportal.event;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base class for all domain events in the Scholarship Portal.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Every event needs common metadata: a unique ID, a timestamp, and a source identifier.
 * This base class ensures consistency across all event types and prevents duplication.
 *
 * DESIGN PATTERN: Template Method Pattern
 * - Defines the skeleton (common fields) that all events inherit
 * - Subclasses add domain-specific fields
 *
 * KAFKA CONCEPTS:
 * - Event Key: Used for partitioning. Events with the same key go to the same partition,
 *   guaranteeing ordering within that key. We use eventId as the default key.
 * - Serialization: Must implement Serializable for Java serialization as a fallback,
 *   but we primarily use JSON serialization via Jackson.
 *
 * INTERVIEW QUESTIONS:
 * 1. Why a base event class? → DRY principle. Common fields like eventId, timestamp,
 *    and source are needed by all events. Prevents inconsistency.
 * 2. Why UUID for eventId? → Globally unique, no coordination needed between services.
 *    Essential for idempotency checks (consumers can detect duplicate deliveries).
 * 3. Why @JsonFormat on timestamp? → Ensures consistent ISO-8601 format in JSON,
 *    regardless of the ObjectMapper's default configuration.
 */
public abstract class BaseEvent implements Serializable {

    private String eventId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private String source;

    protected BaseEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
        this.source = "scholarship-portal";
    }

    // Getters and Setters
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
                "eventId='" + eventId + '\'' +
                ", timestamp=" + timestamp +
                ", source='" + source + '\'' +
                '}';
    }
}

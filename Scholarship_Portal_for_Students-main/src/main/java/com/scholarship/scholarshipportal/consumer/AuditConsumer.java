package com.scholarship.scholarshipportal.consumer;

import com.scholarship.scholarshipportal.config.KafkaConfig;
import com.scholarship.scholarshipportal.event.*;
import com.scholarship.scholarshipportal.service.AuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka Consumer for processing audit log events.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Audit logging is a cross-cutting concern that every service needs but shouldn't be
 * responsible for. Previously, AuditService.logAction() was called directly from:
 * - ApplicationService (APPLY, APPROVE, REJECT)
 * - ScholarshipService (CREATE, DELETE)
 * - AuthService (REGISTER, LOGIN)
 *
 * Problems with synchronous audit logging:
 * 1. If the audit_logs table is locked or slow, it blocks the business operation
 * 2. Every service has a dependency on AuditService
 * 3. Adding new audit points requires modifying business services
 *
 * With Kafka, audit logging is completely decoupled:
 * - Business services publish events to their respective topics
 * - This consumer listens to ALL topics and creates audit entries
 * - If audit logging fails, business operations are not affected
 *
 * DESIGN PATTERN: Event Sourcing (partial)
 * - Events ARE the audit trail. This consumer just persists them to the database.
 *
 * KAFKA CONCEPTS:
 * - Multiple topics: This consumer subscribes to BOTH application-events AND audit-events
 * - Cross-topic consumption: A single consumer can listen to multiple topics
 *
 * INTERVIEW QUESTIONS:
 * 1. Why does this consumer listen to multiple topics? → Audit is a cross-cutting concern.
 *    Every domain event (application, user, notification) should be audited.
 * 2. Is this eventually consistent? → Yes. The audit log might lag behind the actual
 *    operation by a few seconds. For compliance, this is acceptable.
 * 3. What if we need to reconstruct the system state? → With event sourcing, you can
 *    replay all events to rebuild the state. This consumer is a step toward that.
 */
@Component
public class AuditConsumer {

    private static final Logger logger = LoggerFactory.getLogger(AuditConsumer.class);

    private final AuditService auditService;

    public AuditConsumer(AuditService auditService) {
        this.auditService = auditService;
    }

    /**
     * Listens to audit-events topic for centralized audit logging.
     */
    @KafkaListener(
            topics = KafkaConfig.TOPIC_AUDIT_EVENTS,
            groupId = "audit-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleAuditEvent(Object event) {
        try {
            if (event instanceof ApplicationSubmittedEvent submitted) {
                auditService.logAction(
                        "APPLY",
                        submitted.getUsername(),
                        "APPLICATION",
                        submitted.getApplicationId(),
                        "Applied for scholarship: " + submitted.getScholarshipTitle()
                );
                logger.info("Audit logged: APPLICATION SUBMITTED by {}", submitted.getUsername());

            } else if (event instanceof ApplicationApprovedEvent approved) {
                auditService.logAction(
                        "APPROVE",
                        approved.getApprovedBy(),
                        "APPLICATION",
                        approved.getApplicationId(),
                        "Approved application for: " + approved.getScholarshipTitle()
                );
                logger.info("Audit logged: APPLICATION APPROVED by {}", approved.getApprovedBy());

            } else if (event instanceof ApplicationRejectedEvent rejected) {
                auditService.logAction(
                        "REJECT",
                        rejected.getRejectedBy(),
                        "APPLICATION",
                        rejected.getApplicationId(),
                        "Rejected application for: " + rejected.getScholarshipTitle() +
                                (rejected.getReason() != null ? " Reason: " + rejected.getReason() : "")
                );
                logger.info("Audit logged: APPLICATION REJECTED by {}", rejected.getRejectedBy());

            } else if (event instanceof UserRegisteredEvent registered) {
                auditService.logAction(
                        "REGISTER",
                        registered.getUsername(),
                        "USER",
                        registered.getUserId(),
                        "New user registered with role: " + registered.getRole()
                );
                logger.info("Audit logged: USER REGISTERED - {}", registered.getUsername());

            } else if (event instanceof DocumentUploadedEvent uploaded) {
                auditService.logAction(
                        "UPLOAD",
                        uploaded.getUsername(),
                        "DOCUMENT",
                        uploaded.getDocumentId(),
                        "Uploaded document: " + uploaded.getFileName() +
                                " (type: " + uploaded.getDocumentType() + ")"
                );
                logger.info("Audit logged: DOCUMENT UPLOADED by {}", uploaded.getUsername());

            } else {
                logger.warn("Audit consumer received unknown event type: {}",
                        event.getClass().getSimpleName());
            }
        } catch (Exception e) {
            logger.error("Error processing audit event: {}", e.getMessage(), e);
            throw e; // Re-throw for Kafka retry
        }
    }
}

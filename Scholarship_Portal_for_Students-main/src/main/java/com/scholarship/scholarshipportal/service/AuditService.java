package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.entity.AuditLog;
import com.scholarship.scholarshipportal.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing audit logs
 * Provides centralized audit trail for all critical operations
 */
@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Log an audit event
     */
    @Transactional
    public void logAction(String actionType, String performedBy, String targetEntity, Long targetId, String details) {
        try {
            AuditLog log = new AuditLog(actionType, performedBy, targetEntity, targetId, details);
            auditLogRepository.save(log);
            logger.info("Audit Log: {} - {} - {} - ID:{}", actionType, performedBy, targetEntity, targetId);
        } catch (Exception e) {
            logger.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    /**
     * Get audit logs by user
     */
    public List<AuditLog> getLogsByUser(String username) {
        return auditLogRepository.findByPerformedByOrderByTimestampDesc(username);
    }

    /**
     * Get audit logs by entity type
     */
    public List<AuditLog> getLogsByEntity(String entityType) {
        return auditLogRepository.findByTargetEntityOrderByTimestampDesc(entityType);
    }

    /**
     * Get recent audit logs
     */
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}

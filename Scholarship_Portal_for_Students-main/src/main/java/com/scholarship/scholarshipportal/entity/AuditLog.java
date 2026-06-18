package com.scholarship.scholarshipportal.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * Entity for tracking system audit trail
 * Logs all critical operations for compliance and monitoring
 */
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType; // CREATE, UPDATE, DELETE, APPROVE, REJECT

    @Column(name = "performed_by", nullable = false)
    private String performedBy; // Username

    @Column(name = "target_entity", length = 100)
    private String targetEntity; // SCHOLARSHIP, APPLICATION, PROFILE

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "details", length = 500)
    private String details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }

    // Constructors
    public AuditLog() {}

    public AuditLog(String actionType, String performedBy, String targetEntity, Long targetId, String details) {
        this.actionType = actionType;
        this.performedBy = performedBy;
        this.targetEntity = targetEntity;
        this.targetId = targetId;
        this.details = details;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public String getTargetEntity() { return targetEntity; }
    public void setTargetEntity(String targetEntity) { this.targetEntity = targetEntity; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

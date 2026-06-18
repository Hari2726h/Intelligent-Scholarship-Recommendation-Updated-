package com.scholarship.scholarshipportal.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * Tracks detailed stages of application processing
 * Enables multi-stage workflow management
 */
@Entity
@Table(name = "application_stages")
public class ApplicationStage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "stage_status")
    private StageStatus stageStatus;
    
    @Column(name = "stage_name")
    private String stageName;
    
    @Column(name = "reviewer_comments", columnDefinition = "TEXT")
    private String reviewerComments;
    
    @Column(name = "required_documents")
    private String requiredDocuments; // Comma-separated
    
    @Column(name = "documents_verified")
    private Boolean documentsVerified = false;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    public enum StageStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED,
        SKIPPED
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }
    
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    
    public StageStatus getStageStatus() { return stageStatus; }
    public void setStageStatus(StageStatus stageStatus) { this.stageStatus = stageStatus; }
    
    public String getStageName() { return stageName; }
    public void setStageName(String stageName) { this.stageName = stageName; }
    
    public String getReviewerComments() { return reviewerComments; }
    public void setReviewerComments(String reviewerComments) { this.reviewerComments = reviewerComments; }
    
    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }
    
    public Boolean getDocumentsVerified() { return documentsVerified; }
    public void setDocumentsVerified(Boolean documentsVerified) { this.documentsVerified = documentsVerified; }
    
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

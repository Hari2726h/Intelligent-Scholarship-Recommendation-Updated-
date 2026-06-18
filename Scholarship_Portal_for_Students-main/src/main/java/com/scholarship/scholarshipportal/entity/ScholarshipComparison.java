package com.scholarship.scholarshipportal.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * Allows users to save scholarship comparisons for side-by-side analysis
 */
@Entity
@Table(name = "scholarship_comparisons")
public class ScholarshipComparison {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "comparison_name")
    private String comparisonName;
    
    @Column(name = "scholarship_ids")
    private String scholarshipIds; // Comma-separated IDs
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getComparisonName() { return comparisonName; }
    public void setComparisonName(String comparisonName) { this.comparisonName = comparisonName; }
    
    public String getScholarshipIds() { return scholarshipIds; }
    public void setScholarshipIds(String scholarshipIds) { this.scholarshipIds = scholarshipIds; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

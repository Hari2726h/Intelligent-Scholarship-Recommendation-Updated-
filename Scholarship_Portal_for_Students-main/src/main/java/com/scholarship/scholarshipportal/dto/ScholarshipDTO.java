package com.scholarship.scholarshipportal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.*;

import com.scholarship.scholarshipportal.util.ScholarshipLinkUtils;

/**
 * DTO for scholarship data.
 */
public class ScholarshipDTO {
    private Long id;

    @NotBlank(message = "Scholarship title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @DecimalMin(value = "0.0", message = "Minimum CGPA must be at least 0.0")
    @DecimalMax(value = "10.0", message = "Minimum CGPA must not exceed 10.0")
    private Double minCgpa;

    @DecimalMin(value = "0.0", inclusive = true, message = "Maximum income must be non-negative")
    private BigDecimal maxIncome;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @NotNull(message = "Scholarship amount is required")
    @Positive(message = "Scholarship amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Deadline is required")
    @Future(message = "Deadline must be a future date")
    private LocalDate deadline;

    private String createdBy; // username

    @Size(max = 2000, message = "Application link must not exceed 2000 characters")
    private String applicationLink;

    @Size(max = 200, message = "Provider name must not exceed 200 characters")
    private String provider;

    @Min(value = 1, message = "Award count must be at least 1")
    private Integer awardCount;

    private Boolean isActive;
    private LocalDate applicationDeadline;
    private LocalDate applicationStartDate;
    private java.time.LocalDateTime createdAt;

    public String getApplicationLink() { return applicationLink; }
    public void setApplicationLink(String applicationLink) { this.applicationLink = ScholarshipLinkUtils.normalize(applicationLink, provider); }
    
    public String getProvider() { return provider; }
    public void setProvider(String provider) {
        this.provider = provider;
        this.applicationLink = ScholarshipLinkUtils.normalize(applicationLink, provider);
    }
    
    public Integer getAwardCount() { return awardCount; }
    public void setAwardCount(Integer awardCount) { this.awardCount = awardCount; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public LocalDate getApplicationStartDate() { return applicationStartDate; }
    public void setApplicationStartDate(LocalDate applicationStartDate) { this.applicationStartDate = applicationStartDate; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMinCgpa() {
        return minCgpa;
    }

    public void setMinCgpa(Double minCgpa) {
        this.minCgpa = minCgpa;
    }

    public BigDecimal getMaxIncome() {
        return maxIncome;
    }

    public void setMaxIncome(BigDecimal maxIncome) {
        this.maxIncome = maxIncome;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}

package com.scholarship.scholarshipportal.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

/**
 * Defines different types of documents required for scholarships
 */
@Entity
@Table(name = "document_types")
public class DocumentType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "type_name", nullable = false, unique = true)
    private String typeName;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "is_required")
    private Boolean isRequired = false;
    
    @Column(name = "max_file_size_mb")
    private Integer maxFileSizeMb = 5;
    
    @Column(name = "allowed_formats")
    private String allowedFormats; // e.g., "pdf,jpg,png"
    
    @Column(name = "has_expiry")
    private Boolean hasExpiry = false;
    
    @Column(name = "validity_months")
    private Integer validityMonths; // How long document is valid
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
    
    public Integer getMaxFileSizeMb() { return maxFileSizeMb; }
    public void setMaxFileSizeMb(Integer maxFileSizeMb) { this.maxFileSizeMb = maxFileSizeMb; }
    
    public String getAllowedFormats() { return allowedFormats; }
    public void setAllowedFormats(String allowedFormats) { this.allowedFormats = allowedFormats; }
    
    public Boolean getHasExpiry() { return hasExpiry; }
    public void setHasExpiry(Boolean hasExpiry) { this.hasExpiry = hasExpiry; }
    
    public Integer getValidityMonths() { return validityMonths; }
    public void setValidityMonths(Integer validityMonths) { this.validityMonths = validityMonths; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

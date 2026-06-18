package com.scholarship.scholarshipportal.dto;

/**
 * DTO for scholarship with recommendation score
 */
public class ScholarshipRecommendationDTO {

    private Long scholarshipId;
    private String title;
    private String category;
    private Double amount;
    private String deadline;
    private String description;
    private String applicationLink;
    private String provider;
    private Integer awardCount;
    
    private Double matchScore; // Overall match percentage (0-100)
    private String matchLevel; // HIGH, MEDIUM, LOW
    
    private Double cgpaScore;
    private Double incomeScore;
    private Double categoryScore;
    
    private boolean isEligible;
    private boolean isBookmarked;
    private String eligibilityMessage;

    public ScholarshipRecommendationDTO() {
    }

    // Getters and Setters
    public Long getScholarshipId() {
        return scholarshipId;
    }

    public void setScholarshipId(Long scholarshipId) {
        this.scholarshipId = scholarshipId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getApplicationLink() {
        return applicationLink;
    }

    public void setApplicationLink(String applicationLink) {
        this.applicationLink = applicationLink;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Integer getAwardCount() {
        return awardCount;
    }

    public void setAwardCount(Integer awardCount) {
        this.awardCount = awardCount;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
        
        // Auto-set match level based on score
        if (matchScore >= 80) {
            this.matchLevel = "HIGH";
        } else if (matchScore >= 60) {
            this.matchLevel = "MEDIUM";
        } else {
            this.matchLevel = "LOW";
        }
    }

    public String getMatchLevel() {
        return matchLevel;
    }

    public void setMatchLevel(String matchLevel) {
        this.matchLevel = matchLevel;
    }

    public Double getCgpaScore() {
        return cgpaScore;
    }

    public void setCgpaScore(Double cgpaScore) {
        this.cgpaScore = cgpaScore;
    }

    public Double getIncomeScore() {
        return incomeScore;
    }

    public void setIncomeScore(Double incomeScore) {
        this.incomeScore = incomeScore;
    }

    public Double getCategoryScore() {
        return categoryScore;
    }

    public void setCategoryScore(Double categoryScore) {
        this.categoryScore = categoryScore;
    }

    public boolean isEligible() {
        return isEligible;
    }

    public void setEligible(boolean eligible) {
        isEligible = eligible;
    }

    public boolean isBookmarked() {
        return isBookmarked;
    }

    public void setBookmarked(boolean bookmarked) {
        isBookmarked = bookmarked;
    }

    public String getEligibilityMessage() {
        return eligibilityMessage;
    }

    public void setEligibilityMessage(String eligibilityMessage) {
        this.eligibilityMessage = eligibilityMessage;
    }
}

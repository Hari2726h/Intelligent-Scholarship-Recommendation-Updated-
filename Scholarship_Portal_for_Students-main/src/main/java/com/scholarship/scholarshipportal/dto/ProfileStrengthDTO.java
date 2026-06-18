package com.scholarship.scholarshipportal.dto;

/**
 * DTO for profile strength analysis
 */
public class ProfileStrengthDTO {

    private int overallScore; // 0-100
    private String strengthLevel; // WEAK, MEDIUM, STRONG, EXCELLENT
    private int completenessPercentage; // 0-100
    
    private boolean hasBasicInfo;
    private boolean hasContactInfo;
    private boolean hasAcademicInfo;
    private boolean hasFinancialInfo;
    private boolean hasDocuments;
    
    private int totalFields;
    private int completedFields;
    
    private String[] suggestions;
    private String overallMessage;

    public ProfileStrengthDTO() {
    }

    public int getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
        
        // Auto-set strength level
        if (overallScore >= 90) {
            this.strengthLevel = "EXCELLENT";
            this.overallMessage = "🌟 Outstanding profile! You're ready to apply for scholarships.";
        } else if (overallScore >= 70) {
            this.strengthLevel = "STRONG";
            this.overallMessage = "✅ Great profile! Consider adding more details to increase your chances.";
        } else if (overallScore >= 50) {
            this.strengthLevel = "MEDIUM";
            this.overallMessage = "⚠️ Good start! Complete remaining sections to improve your profile.";
        } else {
            this.strengthLevel = "WEAK";
            this.overallMessage = "❌ Incomplete profile. Please add more information to apply for scholarships.";
        }
    }

    public String getStrengthLevel() {
        return strengthLevel;
    }

    public void setStrengthLevel(String strengthLevel) {
        this.strengthLevel = strengthLevel;
    }

    public int getCompletenessPercentage() {
        return completenessPercentage;
    }

    public void setCompletenessPercentage(int completenessPercentage) {
        this.completenessPercentage = completenessPercentage;
    }

    public boolean isHasBasicInfo() {
        return hasBasicInfo;
    }

    public void setHasBasicInfo(boolean hasBasicInfo) {
        this.hasBasicInfo = hasBasicInfo;
    }

    public boolean isHasContactInfo() {
        return hasContactInfo;
    }

    public void setHasContactInfo(boolean hasContactInfo) {
        this.hasContactInfo = hasContactInfo;
    }

    public boolean isHasAcademicInfo() {
        return hasAcademicInfo;
    }

    public void setHasAcademicInfo(boolean hasAcademicInfo) {
        this.hasAcademicInfo = hasAcademicInfo;
    }

    public boolean isHasFinancialInfo() {
        return hasFinancialInfo;
    }

    public void setHasFinancialInfo(boolean hasFinancialInfo) {
        this.hasFinancialInfo = hasFinancialInfo;
    }

    public boolean isHasDocuments() {
        return hasDocuments;
    }

    public void setHasDocuments(boolean hasDocuments) {
        this.hasDocuments = hasDocuments;
    }

    public int getTotalFields() {
        return totalFields;
    }

    public void setTotalFields(int totalFields) {
        this.totalFields = totalFields;
    }

    public int getCompletedFields() {
        return completedFields;
    }

    public void setCompletedFields(int completedFields) {
        this.completedFields = completedFields;
    }

    public String[] getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(String[] suggestions) {
        this.suggestions = suggestions;
    }

    public String getOverallMessage() {
        return overallMessage;
    }

    public void setOverallMessage(String overallMessage) {
        this.overallMessage = overallMessage;
    }
}

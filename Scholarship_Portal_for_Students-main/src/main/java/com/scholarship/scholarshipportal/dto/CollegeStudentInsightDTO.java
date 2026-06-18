package com.scholarship.scholarshipportal.dto;

import java.util.List;

public class CollegeStudentInsightDTO {
    private Long studentId;
    private String studentName;
    private String contactEmail;
    private long documentCount;
    private List<String> documentTypes;
    private int eligibleScholarshipCount;
    private int highMatchScholarshipCount;
    private boolean readyForApplications;
    private ProfileStrengthDTO profileStrength;
    private List<ScholarshipRecommendationDTO> topRecommendations;

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public long getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(long documentCount) {
        this.documentCount = documentCount;
    }

    public List<String> getDocumentTypes() {
        return documentTypes;
    }

    public void setDocumentTypes(List<String> documentTypes) {
        this.documentTypes = documentTypes;
    }

    public int getEligibleScholarshipCount() {
        return eligibleScholarshipCount;
    }

    public void setEligibleScholarshipCount(int eligibleScholarshipCount) {
        this.eligibleScholarshipCount = eligibleScholarshipCount;
    }

    public int getHighMatchScholarshipCount() {
        return highMatchScholarshipCount;
    }

    public void setHighMatchScholarshipCount(int highMatchScholarshipCount) {
        this.highMatchScholarshipCount = highMatchScholarshipCount;
    }

    public boolean isReadyForApplications() {
        return readyForApplications;
    }

    public void setReadyForApplications(boolean readyForApplications) {
        this.readyForApplications = readyForApplications;
    }

    public ProfileStrengthDTO getProfileStrength() {
        return profileStrength;
    }

    public void setProfileStrength(ProfileStrengthDTO profileStrength) {
        this.profileStrength = profileStrength;
    }

    public List<ScholarshipRecommendationDTO> getTopRecommendations() {
        return topRecommendations;
    }

    public void setTopRecommendations(List<ScholarshipRecommendationDTO> topRecommendations) {
        this.topRecommendations = topRecommendations;
    }
}
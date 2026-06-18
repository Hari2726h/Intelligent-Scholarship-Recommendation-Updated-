package com.scholarship.scholarshipportal.dto;

import java.util.ArrayList;
import java.util.List;

public class CollegeEligibilityResultDTO {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private int eligibleScholarshipCount;
    private int emailNotificationsSent;
    private List<String> scholarshipTitles = new ArrayList<>();

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

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public int getEligibleScholarshipCount() {
        return eligibleScholarshipCount;
    }

    public void setEligibleScholarshipCount(int eligibleScholarshipCount) {
        this.eligibleScholarshipCount = eligibleScholarshipCount;
    }

    public int getEmailNotificationsSent() {
        return emailNotificationsSent;
    }

    public void setEmailNotificationsSent(int emailNotificationsSent) {
        this.emailNotificationsSent = emailNotificationsSent;
    }

    public List<String> getScholarshipTitles() {
        return scholarshipTitles;
    }

    public void setScholarshipTitles(List<String> scholarshipTitles) {
        this.scholarshipTitles = scholarshipTitles;
    }
}

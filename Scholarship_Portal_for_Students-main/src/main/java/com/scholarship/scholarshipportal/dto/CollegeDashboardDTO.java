package com.scholarship.scholarshipportal.dto;

public class CollegeDashboardDTO {
    private Long totalManagedStudents;
    private Long studentsWithEmail;
    private Long studentsWithDocuments;
    private Long studentsReadyForApplications;
    private Long totalEligibleScholarships;
    private Long notificationsSentToday;

    public Long getTotalManagedStudents() {
        return totalManagedStudents;
    }

    public void setTotalManagedStudents(Long totalManagedStudents) {
        this.totalManagedStudents = totalManagedStudents;
    }

    public Long getStudentsWithEmail() {
        return studentsWithEmail;
    }

    public void setStudentsWithEmail(Long studentsWithEmail) {
        this.studentsWithEmail = studentsWithEmail;
    }

    public Long getNotificationsSentToday() {
        return notificationsSentToday;
    }

    public void setNotificationsSentToday(Long notificationsSentToday) {
        this.notificationsSentToday = notificationsSentToday;
    }

    public Long getStudentsWithDocuments() {
        return studentsWithDocuments;
    }

    public void setStudentsWithDocuments(Long studentsWithDocuments) {
        this.studentsWithDocuments = studentsWithDocuments;
    }

    public Long getStudentsReadyForApplications() {
        return studentsReadyForApplications;
    }

    public void setStudentsReadyForApplications(Long studentsReadyForApplications) {
        this.studentsReadyForApplications = studentsReadyForApplications;
    }

    public Long getTotalEligibleScholarships() {
        return totalEligibleScholarships;
    }

    public void setTotalEligibleScholarships(Long totalEligibleScholarships) {
        this.totalEligibleScholarships = totalEligibleScholarships;
    }
}

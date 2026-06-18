package com.scholarship.scholarshipportal.dto;

import java.util.Map;

/**
 * DTO for Admin Analytics Dashboard
 */
public class AnalyticsDTO {
    private Long totalUsers;
    private Long totalStudents;
    private Long totalAdmins;
    private Long totalColleges;
    private Long totalScholarships;
    private Long activeScholarships;
    private Long totalApplications;
    private Long pendingApplications;
    private Long approvedApplications;
    private Long rejectedApplications;
    private Double approvalRate;
    private Map<String, Long> applicationsPerScholarship;
    private Map<String, Long> monthlyApplicationTrends;
    private Map<String, Long> categoryDistribution;

    // Constructors
    public AnalyticsDTO() {}

    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public Long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Long totalStudents) { this.totalStudents = totalStudents; }
    public Long getTotalAdmins() { return totalAdmins; }
    public void setTotalAdmins(Long totalAdmins) { this.totalAdmins = totalAdmins; }
    public Long getTotalColleges() { return totalColleges; }
    public void setTotalColleges(Long totalColleges) { this.totalColleges = totalColleges; }
    public Long getTotalScholarships() { return totalScholarships; }
    public void setTotalScholarships(Long totalScholarships) { this.totalScholarships = totalScholarships; }
    public Long getActiveScholarships() { return activeScholarships; }
    public void setActiveScholarships(Long activeScholarships) { this.activeScholarships = activeScholarships; }
    public Long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(Long totalApplications) { this.totalApplications = totalApplications; }
    public Long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(Long pendingApplications) { this.pendingApplications = pendingApplications; }
    public Long getApprovedApplications() { return approvedApplications; }
    public void setApprovedApplications(Long approvedApplications) { this.approvedApplications = approvedApplications; }
    public Long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(Long rejectedApplications) { this.rejectedApplications = rejectedApplications; }
    public Double getApprovalRate() { return approvalRate; }
    public void setApprovalRate(Double approvalRate) { this.approvalRate = approvalRate; }
    public Map<String, Long> getApplicationsPerScholarship() { return applicationsPerScholarship; }
    public void setApplicationsPerScholarship(Map<String, Long> applicationsPerScholarship) { this.applicationsPerScholarship = applicationsPerScholarship; }
    public Map<String, Long> getMonthlyApplicationTrends() { return monthlyApplicationTrends; }
    public void setMonthlyApplicationTrends(Map<String, Long> monthlyApplicationTrends) { this.monthlyApplicationTrends = monthlyApplicationTrends; }
    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }
}

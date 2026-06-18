package com.scholarship.scholarshipportal.dto;

import java.util.List;

public class CollegeStudentNotificationGroupDTO {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private long totalNotifications;
    private long unreadNotifications;
    private List<CollegeNotificationItemDTO> notifications;

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

    public long getTotalNotifications() {
        return totalNotifications;
    }

    public void setTotalNotifications(long totalNotifications) {
        this.totalNotifications = totalNotifications;
    }

    public long getUnreadNotifications() {
        return unreadNotifications;
    }

    public void setUnreadNotifications(long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }

    public List<CollegeNotificationItemDTO> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<CollegeNotificationItemDTO> notifications) {
        this.notifications = notifications;
    }
}
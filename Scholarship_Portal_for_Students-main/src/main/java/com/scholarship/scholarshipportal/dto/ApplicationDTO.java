package com.scholarship.scholarshipportal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.scholarship.scholarshipportal.entity.Application.Status;

public class ApplicationDTO {
    private Long id;
    private StudentDTO student;
    private ScholarshipDTO scholarship;
    private Status status;
    private LocalDate appliedDate;
    private LocalDateTime createdAt;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StudentDTO getStudent() { return student; }
    public void setStudent(StudentDTO student) { this.student = student; }
    public ScholarshipDTO getScholarship() { return scholarship; }
    public void setScholarship(ScholarshipDTO scholarship) { this.scholarship = scholarship; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

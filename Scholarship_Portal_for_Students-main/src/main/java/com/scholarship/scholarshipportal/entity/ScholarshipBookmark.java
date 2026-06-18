package com.scholarship.scholarshipportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for scholarship bookmarking feature
 * Allows students to save scholarships for later
 */
@Entity
@Table(
    name = "scholarship_bookmark",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "scholarship_id"})
)
public class ScholarshipBookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scholarship_id", nullable = false)
    private Scholarship scholarship;

    @Column(name = "bookmarked_at", nullable = false)
    private LocalDateTime bookmarkedAt;

    public ScholarshipBookmark() {
        this.bookmarkedAt = LocalDateTime.now();
    }

    public ScholarshipBookmark(Student student, Scholarship scholarship) {
        this.student = student;
        this.scholarship = scholarship;
        this.bookmarkedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Scholarship getScholarship() {
        return scholarship;
    }

    public void setScholarship(Scholarship scholarship) {
        this.scholarship = scholarship;
    }

    public LocalDateTime getBookmarkedAt() {
        return bookmarkedAt;
    }

    public void setBookmarkedAt(LocalDateTime bookmarkedAt) {
        this.bookmarkedAt = bookmarkedAt;
    }
}

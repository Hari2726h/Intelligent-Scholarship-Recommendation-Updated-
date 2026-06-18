package com.scholarship.scholarshipportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for storing recommendation scores
 * Tracks how well a scholarship matches a student's profile
 */
@Entity
@Table(
    name = "recommendation_score",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "scholarship_id"})
)
public class RecommendationScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scholarship_id", nullable = false)
    private Scholarship scholarship;

    @Column(name = "match_score", nullable = false)
    private Double matchScore; // Overall score 0.00 to 100.00

    @Column(name = "cgpa_score")
    private Double cgpaScore; // Component: CGPA matching

    @Column(name = "income_score")
    private Double incomeScore; // Component: Income proximity

    @Column(name = "category_score")
    private Double categoryScore; // Component: Category match

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    public RecommendationScore() {
        this.calculatedAt = LocalDateTime.now();
    }

    public RecommendationScore(Student student, Scholarship scholarship, Double matchScore) {
        this.student = student;
        this.scholarship = scholarship;
        this.matchScore = matchScore;
        this.calculatedAt = LocalDateTime.now();
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

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
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

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}

package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.dto.ScholarshipRecommendationDTO;
import com.scholarship.scholarshipportal.entity.*;
import com.scholarship.scholarshipportal.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for intelligent scholarship recommendations
 * Calculates match scores based on CGPA, income, category, and other factors
 */
@Service
public class RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    private final RecommendationScoreRepository recommendationRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final StudentRepository studentRepository;
    private final ScholarshipBookmarkRepository bookmarkRepository;

    public RecommendationService(RecommendationScoreRepository recommendationRepository,
                                ScholarshipRepository scholarshipRepository,
                                StudentRepository studentRepository,
                                ScholarshipBookmarkRepository bookmarkRepository) {
        this.recommendationRepository = recommendationRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.studentRepository = studentRepository;
        this.bookmarkRepository = bookmarkRepository;
    }

    /**
     * Get personalized scholarship recommendations for a student
     */
    @Transactional
    public List<ScholarshipRecommendationDTO> getRecommendations(Student student) {
        String studentIdentifier = student.getUser() != null
            ? student.getUser().getUsername()
            : (student.getContactEmail() != null && !student.getContactEmail().isBlank()
                ? student.getContactEmail()
                : "managed-student-" + student.getId());
        logger.info("Generating recommendations for student: {}", studentIdentifier);

        // Get active scholarships
        List<Scholarship> activeScholarships = scholarshipRepository
                .findByIsDeletedFalseAndIsActiveTrue();

        List<ScholarshipRecommendationDTO> recommendations = new ArrayList<>();

        for (Scholarship scholarship : activeScholarships) {
            // Calculate match score
            double matchScore = calculateMatchScore(student, scholarship);

            // Create recommendation DTO
            ScholarshipRecommendationDTO dto = new ScholarshipRecommendationDTO();
            dto.setScholarshipId(scholarship.getId());
            dto.setTitle(scholarship.getTitle());
            dto.setCategory(scholarship.getCategory());
            dto.setAmount(scholarship.getAmount() != null ? scholarship.getAmount().doubleValue() : 0.0);
            dto.setDeadline(scholarship.getDeadline() != null ? scholarship.getDeadline().toString() : null);
            dto.setDescription(scholarship.getDescription());
            dto.setApplicationLink(scholarship.getApplicationLink());
            dto.setProvider(scholarship.getProvider());
            dto.setAwardCount(scholarship.getAwardCount());
            dto.setMatchScore(matchScore); // This also sets matchLevel
            
            // Calculate component scores
            dto.setCgpaScore(calculateCGPAScore(student, scholarship));
            dto.setIncomeScore(calculateIncomeScore(student, scholarship));
            dto.setCategoryScore(calculateCategoryScore(student, scholarship));

            // Check eligibility
            boolean eligible = isEligible(student, scholarship);
            dto.setEligible(eligible);
            dto.setEligibilityMessage(getEligibilityMessage(student, scholarship));

            // Check if bookmarked
            boolean bookmarked = bookmarkRepository.existsByStudentIdAndScholarshipId(
                    student.getId(), scholarship.getId());
            dto.setBookmarked(bookmarked);

            recommendations.add(dto);

            // Save/update recommendation score in database
            saveRecommendationScore(student, scholarship, matchScore, 
                                   dto.getCgpaScore(), dto.getIncomeScore(), dto.getCategoryScore());
        }

        // Sort by match score descending
        recommendations.sort(Comparator.comparing(ScholarshipRecommendationDTO::getMatchScore).reversed());

        logger.info("Generated {} recommendations for student", recommendations.size());
        return recommendations;
    }

    /**
     * Get top N recommendations
     */
    public List<ScholarshipRecommendationDTO> getTopRecommendations(Student student, int limit) {
        List<ScholarshipRecommendationDTO> allRecommendations = getRecommendations(student);
        return allRecommendations.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Calculate overall match score (0-100)
     * Weighted combination of multiple factors
     */
    private double calculateMatchScore(Student student, Scholarship scholarship) {
        double cgpaScore = calculateCGPAScore(student, scholarship);
        double incomeScore = calculateIncomeScore(student, scholarship);
        double categoryScore = calculateCategoryScore(student, scholarship);

        // Weighted average (can be customized)
        double weightedScore = (cgpaScore * 0.40) +      // 40% weight on CGPA
                              (incomeScore * 0.30) +     // 30% weight on income
                              (categoryScore * 0.30);    // 30% weight on category

        return Math.round(weightedScore * 100.0) / 100.0;
    }

    /**
     * Calculate CGPA match score (0-100)
     */
    private double calculateCGPAScore(Student student, Scholarship scholarship) {
        double studentCGPA = student.getCgpa() != null ? student.getCgpa() : 0.0;
        double requiredCGPA = scholarship.getMinCgpa() != null ? scholarship.getMinCgpa() : 0.0;

        if (studentCGPA >= requiredCGPA) {
            // Higher CGPA than required = higher score
            double excess = studentCGPA - requiredCGPA;
            return Math.min(100, 80 + (excess * 5)); // Base 80% + bonus
        } else {
            // Below required CGPA = lower score
            double deficit = requiredCGPA - studentCGPA;
            return Math.max(0, 50 - (deficit * 20)); // Penalty for deficit
        }
    }

    /**
     * Calculate income match score (0-100)
     * Lower income students get higher scores for need-based scholarships
     */
    private double calculateIncomeScore(Student student, Scholarship scholarship) {
        double studentIncome = student.getAnnualIncome() != null ? student.getAnnualIncome().doubleValue() : 0.0;
        double maxIncome = scholarship.getMaxIncome() != null ? scholarship.getMaxIncome().doubleValue() : Double.MAX_VALUE;

        if (studentIncome > maxIncome) {
            // Not eligible by income
            return 0;
        }

        // Lower income = higher score (inverse relationship)
        double incomeRatio = studentIncome / maxIncome;
        return Math.round((1 - incomeRatio) * 100.0);
    }

    /**
     * Calculate category match score (0-100)
     */
    private double calculateCategoryScore(Student student, Scholarship scholarship) {
        String studentCategory = student.getCategory();
        String scholarshipCategory = scholarship.getCategory();

        if (scholarshipCategory == null || scholarshipCategory.equals("GENERAL")) {
            return 70; // General scholarships are moderately scored for everyone
        }

        if (studentCategory != null && studentCategory.equals(scholarshipCategory)) {
            return 100; // Perfect match
        }

        return 30; // Low score if doesn't match category
    }

    /**
     * Check basic eligibility
     */
    private boolean isEligible(Student student, Scholarship scholarship) {
        double studentCgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
        double requiredCgpa = scholarship.getMinCgpa() != null ? scholarship.getMinCgpa() : 0.0;
        double studentIncome = student.getAnnualIncome() != null ? student.getAnnualIncome().doubleValue() : 0.0;
        double maxIncome = scholarship.getMaxIncome() != null ? scholarship.getMaxIncome().doubleValue() : Double.MAX_VALUE;
        
        return studentCgpa >= requiredCgpa && studentIncome <= maxIncome;
    }

    /**
     * Generate human-readable eligibility message
     */
    private String getEligibilityMessage(Student student, Scholarship scholarship) {
        List<String> issues = new ArrayList<>();

        double studentCgpa = student.getCgpa() != null ? student.getCgpa() : 0.0;
        double requiredCgpa = scholarship.getMinCgpa() != null ? scholarship.getMinCgpa() : 0.0;
        double studentIncome = student.getAnnualIncome() != null ? student.getAnnualIncome().doubleValue() : 0.0;
        double maxIncome = scholarship.getMaxIncome() != null ? scholarship.getMaxIncome().doubleValue() : Double.MAX_VALUE;

        if (studentCgpa < requiredCgpa) {
            issues.add(String.format("CGPA %.2f required (you have %.2f)", 
                       requiredCgpa, studentCgpa));
        }

        if (studentIncome > maxIncome) {
            issues.add(String.format("Max income ₹%.0f (you have ₹%.0f)", 
                       maxIncome, studentIncome));
        }

        if (issues.isEmpty()) {
            return "✅ You are eligible for this scholarship!";
        } else {
            return "❌ " + String.join(", ", issues);
        }
    }

    /**
     * Save recommendation score to database
     */
    private void saveRecommendationScore(Student student, Scholarship scholarship, 
                                        double matchScore, double cgpaScore, 
                                        double incomeScore, double categoryScore) {
        RecommendationScore score = recommendationRepository
                .findByStudentIdAndScholarshipId(student.getId(), scholarship.getId())
                .orElse(new RecommendationScore());

        score.setStudent(student);
        score.setScholarship(scholarship);
        score.setMatchScore(matchScore);
        score.setCgpaScore(cgpaScore);
        score.setIncomeScore(incomeScore);
        score.setCategoryScore(categoryScore);

        recommendationRepository.save(score);
    }

    /**
     * Refresh recommendations for all students (can be run as a scheduled job)
     */
    @Transactional
    public void refreshAllRecommendations() {
        logger.info("Refreshing recommendations for all students...");
        
        List<Student> allStudents = studentRepository.findAll();
        
        for (Student student : allStudents) {
            try {
                getRecommendations(student); // This saves scores to DB
            } catch (Exception e) {
                logger.error("Failed to refresh recommendations for student {}: {}", 
                           student.getId(), e.getMessage());
            }
        }
        
        logger.info("Recommendation refresh completed for {} students", allStudents.size());
    }
}

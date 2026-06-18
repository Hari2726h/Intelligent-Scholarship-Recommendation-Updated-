package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.dto.ProfileStrengthDTO;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.repository.StudentDocumentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for calculating student profile strength and completeness
 * Encourages students to complete their profiles for better scholarship matching
 */
@Service
public class ProfileStrengthService {

    private final StudentDocumentRepository documentRepository;

    public ProfileStrengthService(StudentDocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /**
     * Calculate comprehensive profile strength score
     */
    public ProfileStrengthDTO calculateProfileStrength(Student student) {
        ProfileStrengthDTO strength = new ProfileStrengthDTO();

        int totalFields = 10; // Total required/recommended fields
        int completedFields = 0;
        List<String> suggestions = new ArrayList<>();

        // Basic Information (3 fields: name, email, category)
        boolean hasBasicInfo = true;
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            hasBasicInfo = false;
            suggestions.add("Add your full name");
        } else {
            completedFields++;
        }

        String contactEmail = student.getUser() != null ? student.getUser().getEmail() : student.getContactEmail();
        if (contactEmail == null || contactEmail.trim().isEmpty()) {
            hasBasicInfo = false;
            suggestions.add("Add your email address");
        } else {
            completedFields++;
        }

        if (student.getCategory() == null || student.getCategory().trim().isEmpty()) {
            hasBasicInfo = false;
            suggestions.add("Add your category (General/SC/ST/OBC)");
        } else {
            completedFields++;
        }

        strength.setHasBasicInfo(hasBasicInfo);

        // Contact Information (always true for now as these fields don't exist in Student entity)
        strength.setHasContactInfo(true);

        // Academic Information (4 fields: tenth, twelfth, cgpa, and documents)
        boolean hasAcademicInfo = true;
        
        if (student.getTenthMarks() <= 0) {
            hasAcademicInfo = false;
            suggestions.add("Add your 10th marks");
        } else {
            completedFields++;
        }

        if (student.getTwelfthMarks() <= 0) {
            hasAcademicInfo = false;
            suggestions.add("Add your 12th marks");
        } else {
            completedFields++;
        }

        if (student.getCgpa() == null || student.getCgpa() <= 0) {
            hasAcademicInfo = false;
            suggestions.add("Add your CGPA/Percentage");
        } else {
            completedFields++;
        }

        strength.setHasAcademicInfo(hasAcademicInfo);

        // Financial Information (2 fields)
        boolean hasFinancialInfo = true;
        if (student.getAnnualIncome() == null || student.getAnnualIncome().doubleValue() <= 0) {
            hasFinancialInfo = false;
            suggestions.add("Add your annual family income");
        } else {
            completedFields++;
        }

        strength.setHasFinancialInfo(hasFinancialInfo);

        // Documents (2 fields - count uploaded documents)
        long documentCount = documentRepository.countByStudentId(student.getId());
        boolean hasDocuments = documentCount > 0;
        
        if (documentCount == 0) {
            suggestions.add("Upload required documents (ID proof, income certificate, etc.)");
        } else if (documentCount < 3) {
            completedFields++;
            suggestions.add("Upload more documents for verification");
        } else {
            completedFields += 2; // Bonus for multiple documents
        }

        strength.setHasDocuments(hasDocuments);

        // Calculate overall metrics
        strength.setTotalFields(totalFields);
        strength.setCompletedFields(completedFields);
        
        int completenessPercentage = (completedFields * 100) / totalFields;
        strength.setCompletenessPercentage(completenessPercentage);

        // Calculate weighted score (gives more weight to critical fields)
        int score = 0;
        score += hasBasicInfo ? 30 : 0;
        score += hasAcademicInfo ? 40 : 0;
        score += hasFinancialInfo ? 25 : 0;
        score += hasDocuments ? 5 : 0;

        strength.setOverallScore(score); // This also sets strengthLevel and overallMessage

        strength.setSuggestions(suggestions.toArray(new String[0]));

        return strength;
    }

    /**
     * Quick check if profile is strong enough to apply
     */
    public boolean isProfileStrongEnough(Student student, int minScore) {
        ProfileStrengthDTO strength = calculateProfileStrength(student);
        return strength.getOverallScore() >= minScore;
    }
}

package com.scholarship.scholarshipportal.repository;

import com.scholarship.scholarshipportal.entity.RecommendationScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationScoreRepository extends JpaRepository<RecommendationScore, Long> {

    /**
     * Find all recommendations for a student, ordered by match score
     */
    List<RecommendationScore> findByStudentIdOrderByMatchScoreDesc(Long studentId);

    /**
     * Find recommendation for specific student-scholarship pair
     */
    Optional<RecommendationScore> findByStudentIdAndScholarshipId(Long studentId, Long scholarshipId);

    /**
     * Find top N recommendations for a student
     */
    List<RecommendationScore> findTop10ByStudentIdOrderByMatchScoreDesc(Long studentId);

    /**
     * Delete old recommendations for a student
     */
    void deleteByStudentId(Long studentId);
}

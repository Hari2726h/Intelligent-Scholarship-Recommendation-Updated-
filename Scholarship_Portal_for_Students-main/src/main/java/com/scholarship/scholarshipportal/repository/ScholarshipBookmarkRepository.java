package com.scholarship.scholarshipportal.repository;

import com.scholarship.scholarshipportal.entity.ScholarshipBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScholarshipBookmarkRepository extends JpaRepository<ScholarshipBookmark, Long> {

    /**
     * Find all bookmarks for a student
     */
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"scholarship", "scholarship.createdBy"})
    List<ScholarshipBookmark> findByStudentId(Long studentId);

    /**
     * Check if scholarship is bookmarked by student
     */
    boolean existsByStudentIdAndScholarshipId(Long studentId, Long scholarshipId);

    /**
     * Find specific bookmark
     */
    Optional<ScholarshipBookmark> findByStudentIdAndScholarshipId(Long studentId, Long scholarshipId);

    /**
     * Count bookmarks for a scholarship
     */
    long countByScholarshipId(Long scholarshipId);

    /**
     * Delete bookmark
     */
    void deleteByStudentIdAndScholarshipId(Long studentId, Long scholarshipId);

    /**
     * Get most bookmarked scholarships
     */
    @Query("SELECT b.scholarship, COUNT(b) as bookmarkCount FROM ScholarshipBookmark b " +
           "GROUP BY b.scholarship ORDER BY bookmarkCount DESC")
    List<Object[]> findMostBookmarkedScholarships();
}

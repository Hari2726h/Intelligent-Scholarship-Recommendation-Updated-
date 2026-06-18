package com.scholarship.scholarshipportal.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.scholarship.scholarshipportal.entity.Scholarship;

@Repository
public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {
    
    // Soft delete support - exclude deleted scholarships
    Page<Scholarship> findAllByIsDeletedFalse(Pageable pageable);
    List<Scholarship> findAllByIsDeletedFalse();
    List<Scholarship> findByIsDeletedFalseAndIsActiveTrue();
    
    // Analytics
    long countByIsDeletedFalseAndIsActiveTrue();
    
    Page<Scholarship> findAllByDeadlineAfter(LocalDate localDate, Pageable pageable);

    @Query("SELECT s FROM Scholarship s WHERE " +
           "s.isDeleted = false AND s.isActive = true AND " +
           "(s.minCgpa IS NULL OR s.minCgpa <= :cgpa) AND " +
           "(s.maxIncome IS NULL OR s.maxIncome >= :income) AND " +
           "(s.category IS NULL OR s.category = '' OR s.category = :category) AND " +
           "(s.deadline >= :today) AND " +
           "(s.applicationStartDate <= :today)")
    List<Scholarship> findEligibleScholarships(
            @Param("cgpa") Double cgpa,
            @Param("income") BigDecimal income,
            @Param("category") String category,
            @Param("today") LocalDate today
    );
}

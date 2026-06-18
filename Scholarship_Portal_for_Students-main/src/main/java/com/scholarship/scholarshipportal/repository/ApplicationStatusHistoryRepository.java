package com.scholarship.scholarshipportal.repository;

import com.scholarship.scholarshipportal.entity.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for application status history
 */
@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {
    List<ApplicationStatusHistory> findByApplicationIdOrderByChangedAtDesc(Long applicationId);
    List<ApplicationStatusHistory> findByChangedByOrderByChangedAtDesc(String changedBy);
}

package com.scholarship.scholarshipportal.repository;

import com.scholarship.scholarshipportal.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for audit log operations
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);
    List<AuditLog> findByTargetEntityOrderByTimestampDesc(String targetEntity);
    List<AuditLog> findTop100ByOrderByTimestampDesc();
}

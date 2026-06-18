package com.scholarship.scholarshipportal.repository;

import com.scholarship.scholarshipportal.entity.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository for student documents
 */
@Repository
public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {
    List<StudentDocument> findByStudentIdOrderByUploadedAtDesc(Long studentId);
    List<StudentDocument> findByStudentIdAndDocumentType(Long studentId, String documentType);
    long countByStudentId(Long studentId);
}

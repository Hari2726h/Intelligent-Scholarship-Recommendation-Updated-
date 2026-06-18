package com.scholarship.scholarshipportal.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.scholarship.scholarshipportal.entity.Application;
import com.scholarship.scholarshipportal.entity.Application.Status;
import com.scholarship.scholarshipportal.entity.Scholarship;
import com.scholarship.scholarshipportal.entity.Student;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent(Student student);
    boolean existsByStudentAndScholarship(Student student, Scholarship scholarship);
    Page<Application> findAll(Pageable pageable);
    
    // Analytics methods
    long countByStatus(Status status);
    List<Application> findByStatus(Status status);
}

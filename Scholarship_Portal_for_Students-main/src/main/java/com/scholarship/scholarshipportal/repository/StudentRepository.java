package com.scholarship.scholarshipportal.repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.User;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Fetch student profile from logged-in user
    Optional<Student> findByUser(User user);
    Optional<Student> findByCollegeManagerAndId(User collegeManager, Long id);
    List<Student> findByCollegeManagerOrderByIdDesc(User collegeManager);
    long countByCollegeManager(User collegeManager);

    boolean existsByUser(User user);

    // Eligibility pre-filtering
    List<Student> findByAnnualIncomeLessThanEqual(BigDecimal income);

    List<Student> findByCategory(String category);

}
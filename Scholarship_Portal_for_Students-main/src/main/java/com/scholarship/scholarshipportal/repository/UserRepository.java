package com.scholarship.scholarshipportal.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.scholarship.scholarshipportal.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Used for login (JWT)
    Optional<User> findByUsername(String username);

    // Used for validation
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // Admin analytics
    List<User> findByRole(String role);
    long countByRole(String role);

    // Used by Kafka consumers
    Optional<User> findByEmail(String email);
}
package com.scholarship.scholarshipportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.dto.StudentDTO;
import com.scholarship.scholarshipportal.dto.ProfileStrengthDTO;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.exception.ResourceNotFoundException;
import com.scholarship.scholarshipportal.repository.UserRepository;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.service.StudentService;
import com.scholarship.scholarshipportal.service.ProfileStrengthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Student Profile", description = "Student profile management APIs")
@RestController
@RequestMapping("/profile")
public class StudentController {

    private final StudentService studentService;
    private final ProfileStrengthService profileStrengthService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public StudentController(StudentService studentService, 
                           ProfileStrengthService profileStrengthService,
                           UserRepository userRepository,
                           StudentRepository studentRepository) {
        this.studentService = studentService;
        this.profileStrengthService = profileStrengthService;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Operation(summary = "Create or update student profile",
            description = "Creates a new student profile or updates an existing one for the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile saved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<StudentDTO>> createOrUpdateProfile(
            @Valid @RequestBody StudentDTO student,
            Authentication authentication) {

        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Profile saved successfully",
                studentService.createOrUpdateProfile(student, username)));
    }

    @Operation(summary = "Get student profile",
            description = "Returns the profile of the authenticated student.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<StudentDTO>> getProfile(Authentication authentication) {

        String username = authentication.getName();
        StudentDTO dto = studentService.getProfile(username);
        if (dto == null) {
            return ResponseEntity.ok(ApiResponse.error("Profile not found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", dto));
    }

    @Operation(summary = "Get profile strength analysis",
            description = "Calculates a profile completeness score with actionable recommendations for improvement.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile strength calculated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student profile not found")
    })
    @GetMapping("/strength")
    public ResponseEntity<ApiResponse<ProfileStrengthDTO>> getProfileStrength(
            Authentication authentication) {
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + username));
        
        ProfileStrengthDTO strength = profileStrengthService.calculateProfileStrength(student);
        
        return ResponseEntity.ok(ApiResponse.success("Profile strength calculated", strength));
    }
}
package com.scholarship.scholarshipportal.controller;

import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.dto.ScholarshipDTO;
import com.scholarship.scholarshipportal.dto.ScholarshipRecommendationDTO;
import com.scholarship.scholarshipportal.entity.ScholarshipBookmark;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.exception.ResourceNotFoundException;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;
import com.scholarship.scholarshipportal.service.BookmarkService;
import com.scholarship.scholarshipportal.service.RecommendationService;
import com.scholarship.scholarshipportal.util.DtoMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller for scholarship recommendations and bookmarks
 */
@Tag(name = "Recommendations & Bookmarks", description = "AI-powered scholarship recommendations and bookmark management")
@RestController
@RequestMapping("/student")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final BookmarkService bookmarkService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public RecommendationController(RecommendationService recommendationService,
                                   BookmarkService bookmarkService,
                                   UserRepository userRepository,
                                   StudentRepository studentRepository) {
        this.recommendationService = recommendationService;
        this.bookmarkService = bookmarkService;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Operation(summary = "Get personalized scholarship recommendations",
            description = "Returns AI-powered scholarship recommendations based on the student's profile, "
                    + "academic performance, income level, and category.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Recommendations generated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student profile not found")
    })
    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<ScholarshipRecommendationDTO>>> getRecommendations(
            Authentication authentication) {
        
        Student student = getAuthenticatedStudent(authentication);
        List<ScholarshipRecommendationDTO> recommendations = recommendationService.getRecommendations(student);
        
        return ResponseEntity.ok(
            ApiResponse.success("Recommendations generated successfully", recommendations)
        );
    }

    @Operation(summary = "Get top N recommendations",
            description = "Returns the top N scholarship recommendations sorted by match score.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Top recommendations retrieved")
    })
    @GetMapping("/recommendations/top/{limit}")
    public ResponseEntity<ApiResponse<List<ScholarshipRecommendationDTO>>> getTopRecommendations(
            @Parameter(description = "Maximum number of recommendations") @PathVariable int limit,
            Authentication authentication) {
        
        Student student = getAuthenticatedStudent(authentication);
        List<ScholarshipRecommendationDTO> recommendations = 
            recommendationService.getTopRecommendations(student, limit);
        
        return ResponseEntity.ok(
            ApiResponse.success("Top recommendations retrieved successfully", recommendations)
        );
    }

    @Operation(summary = "Bookmark a scholarship",
            description = "Saves a scholarship to the student's bookmarks for later review.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Scholarship bookmarked"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Already bookmarked")
    })
    @PostMapping("/bookmarks/{scholarshipId}")
    public ResponseEntity<ApiResponse<ScholarshipBookmark>> bookmarkScholarship(
            @Parameter(description = "Scholarship ID") @PathVariable Long scholarshipId,
            Authentication authentication) {
        
        Student student = getAuthenticatedStudent(authentication);
        ScholarshipBookmark bookmark = bookmarkService.bookmarkScholarship(student, scholarshipId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Scholarship bookmarked successfully", bookmark)
        );
    }

    @Operation(summary = "Remove bookmark",
            description = "Removes a scholarship from the student's bookmarks.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookmark removed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Bookmark not found")
    })
    @DeleteMapping("/bookmarks/{scholarshipId}")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @Parameter(description = "Scholarship ID") @PathVariable Long scholarshipId,
            Authentication authentication) {
        
        Student student = getAuthenticatedStudent(authentication);
        bookmarkService.removeBookmark(student, scholarshipId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Bookmark removed successfully", null)
        );
    }

    @Operation(summary = "Get all bookmarked scholarships",
            description = "Returns all scholarships bookmarked by the authenticated student.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookmarks retrieved")
    })
    @GetMapping("/bookmarks")
    public ResponseEntity<ApiResponse<List<ScholarshipDTO>>> getBookmarkedScholarships(
            Authentication authentication) {
        
        Student student = getAuthenticatedStudent(authentication);
        List<ScholarshipDTO> scholarships = bookmarkService.getBookmarkedScholarships(student)
                .stream()
                .map(DtoMapper::mapToScholarshipDTO)
                .toList();
        
        return ResponseEntity.ok(
            ApiResponse.success("Bookmarked scholarships retrieved successfully", scholarships)
        );
    }

    @Operation(summary = "Check if scholarship is bookmarked",
            description = "Returns true if the specified scholarship is bookmarked by the authenticated student.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookmark status checked")
    })
    @GetMapping("/bookmarks/check/{scholarshipId}")
    public ResponseEntity<ApiResponse<Boolean>> isBookmarked(
            @Parameter(description = "Scholarship ID") @PathVariable Long scholarshipId,
            Authentication authentication) {
        
        Student student = getAuthenticatedStudent(authentication);
        boolean bookmarked = bookmarkService.isBookmarked(student, scholarshipId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Bookmark status checked", bookmarked)
        );
    }

    /**
     * Helper method to get authenticated student
     */
    private Student getAuthenticatedStudent(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + username));
    }
}

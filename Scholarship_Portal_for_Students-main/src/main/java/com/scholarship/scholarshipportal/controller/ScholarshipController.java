package com.scholarship.scholarshipportal.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.dto.ScholarshipDTO;

import com.scholarship.scholarshipportal.service.ScholarshipService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Scholarships", description = "Scholarship CRUD and eligibility APIs")
@RestController
@RequestMapping("/scholarships")
public class ScholarshipController {

    private final ScholarshipService scholarshipService;

    public ScholarshipController(ScholarshipService scholarshipService) {
        this.scholarshipService = scholarshipService;
    }

    @Operation(summary = "Create a new scholarship (Admin only)",
            description = "Creates a new scholarship. Requires ROLE_ADMIN authority.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Scholarship created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Admin access required")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<ScholarshipDTO>> createScholarship(
            @Valid @RequestBody ScholarshipDTO scholarshipDTO, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Scholarship created successfully",
                scholarshipService.createScholarship(scholarshipDTO, auth.getName())));
    }

    @Operation(summary = "Delete a scholarship (Admin only)",
            description = "Permanently deletes a scholarship by ID. Requires ROLE_ADMIN authority.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Scholarship deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Scholarship not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScholarship(
            @Parameter(description = "Scholarship ID") @PathVariable Long id) {
        scholarshipService.deleteScholarship(id);
        return ResponseEntity.ok(ApiResponse.success("Scholarship deleted successfully", null));
    }

    @Operation(summary = "Get all scholarships (paginated)",
            description = "Returns a paginated list of all scholarships. This is a public endpoint.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Scholarships fetched successfully")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ScholarshipDTO>>> getAllScholarships(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Fetched successfully",
                scholarshipService.getAllScholarships(PageRequest.of(page, size))));
    }

    @Operation(summary = "Get scholarship by ID",
            description = "Returns detailed information about a specific scholarship. This is a public endpoint.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Scholarship fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Scholarship not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScholarshipDTO>> getScholarshipById(
            @Parameter(description = "Scholarship ID") @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Scholarship fetched successfully",
                scholarshipService.getScholarshipById(id)));
    }

    @Operation(summary = "Get eligible scholarships for current student",
            description = "Returns scholarships the authenticated student is eligible for based on their profile (CGPA, income, category).")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Eligible scholarships fetched"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication required")
    })
    @GetMapping("/eligible")
    public ResponseEntity<ApiResponse<List<ScholarshipDTO>>> getEligible(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Fetched eligible successfully",
                scholarshipService.getEligibleScholarships(username)));
    }
}
package com.scholarship.scholarshipportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.List;

import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.dto.ApplicationDTO;
import com.scholarship.scholarshipportal.service.ApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Applications", description = "Scholarship application management APIs")
@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Operation(summary = "Apply for a scholarship (Student only)",
            description = "Submits a scholarship application for the authenticated student. "
                    + "Publishes an ApplicationSubmittedEvent to Kafka for async processing.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Application submitted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Scholarship not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Already applied to this scholarship")
    })
    @PostMapping("/apply/{scholarshipId}")
    public ResponseEntity<ApiResponse<ApplicationDTO>> apply(
            @Parameter(description = "Scholarship ID to apply for") @PathVariable Long scholarshipId,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Applied successfully",
                applicationService.apply(scholarshipId, username)));
    }

    @Operation(summary = "Get my applications (Student only)",
            description = "Returns all scholarship applications submitted by the authenticated student.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Applications fetched successfully")
    })
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ApplicationDTO>>> myApplications(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Fetched successfully",
                applicationService.getMyApplications(username)));
    }

    @Operation(summary = "Get all applications (Admin only)",
            description = "Returns a paginated list of all scholarship applications across all students.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All applications fetched"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Admin access required")
    })
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<ApplicationDTO>>> allApplications(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Fetched all successfully",
                applicationService.getAllApplications(PageRequest.of(page, size))));
    }
}
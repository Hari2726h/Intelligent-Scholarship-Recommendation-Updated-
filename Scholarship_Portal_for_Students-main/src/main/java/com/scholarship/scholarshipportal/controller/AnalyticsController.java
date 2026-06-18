package com.scholarship.scholarshipportal.controller;

import com.scholarship.scholarshipportal.dto.AnalyticsDTO;
import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller for admin analytics and insights
 */
@Tag(name = "Analytics", description = "Admin analytics dashboard APIs")
@RestController
@RequestMapping("/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Operation(summary = "Get admin analytics dashboard",
            description = "Returns comprehensive analytics including total users, scholarships, applications, "
                    + "approval rates, monthly trends, and category distribution. Cached in Redis for 5 minutes.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Analytics retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Admin access required")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getAnalytics() {
        AnalyticsDTO analytics = analyticsService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved successfully", analytics));
    }
}

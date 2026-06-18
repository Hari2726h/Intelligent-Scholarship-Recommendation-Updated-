package com.scholarship.scholarshipportal.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.dto.CollegeDashboardDTO;
import com.scholarship.scholarshipportal.dto.CollegeEligibilityResultDTO;
import com.scholarship.scholarshipportal.dto.CollegeStudentInsightDTO;
import com.scholarship.scholarshipportal.dto.CollegeStudentNotificationGroupDTO;
import com.scholarship.scholarshipportal.dto.CollegeUploadResultDTO;
import com.scholarship.scholarshipportal.dto.StudentDTO;
import com.scholarship.scholarshipportal.service.StudentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "College Management", description = "College administrator student management APIs")
@RestController
@RequestMapping("/college")
public class CollegeManagementController {

    private final StudentService studentService;

    public CollegeManagementController(StudentService studentService) {
        this.studentService = studentService;
    }

    @Operation(summary = "Get college dashboard",
            description = "Returns dashboard statistics for the college administrator, "
                    + "including managed student count and application metrics.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Dashboard fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "College role required")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<CollegeDashboardDTO>> getDashboard(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "College dashboard fetched successfully",
                studentService.getCollegeDashboardStats(username)));
    }

    @Operation(summary = "Get managed students",
            description = "Returns all students managed by the authenticated college administrator.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Students fetched successfully")
    })
    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentDTO>>> getManagedStudents(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Managed students fetched successfully",
                studentService.getManagedStudents(username)));
    }

    @Operation(summary = "Get student insights",
            description = "Returns detailed insights for a specific managed student including applications and recommendations.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Insights fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/students/{id}/insights")
    public ResponseEntity<ApiResponse<CollegeStudentInsightDTO>> getManagedStudentInsights(
            @Parameter(description = "Student ID") @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Managed student insights fetched successfully",
                studentService.getManagedStudentInsights(id, username)));
    }

    @Operation(summary = "Get grouped notifications",
            description = "Returns notifications grouped by student for the college administrator.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Grouped notifications fetched")
    })
    @GetMapping("/notifications/grouped")
    public ResponseEntity<ApiResponse<List<CollegeStudentNotificationGroupDTO>>> getGroupedNotifications(
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Grouped college notifications fetched successfully",
                studentService.getCollegeNotificationsGroupedByStudent(username)));
    }

    @Operation(summary = "Add managed student",
            description = "Creates a new student profile managed by the authenticated college administrator.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Student added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error")
    })
    @PostMapping("/students")
    public ResponseEntity<ApiResponse<StudentDTO>> addManagedStudent(
            @Valid @RequestBody StudentDTO studentDTO,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Student added successfully",
                studentService.createOrUpdateManagedStudent(studentDTO, username)));
    }

    @Operation(summary = "Upload students via CSV",
            description = "Bulk upload student profiles from a CSV file.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "CSV uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid CSV format")
    })
    @PostMapping("/students/upload")
    public ResponseEntity<ApiResponse<CollegeUploadResultDTO>> uploadStudents(
            @Parameter(description = "CSV file with student data") @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Student CSV uploaded successfully",
                studentService.uploadManagedStudentsFromCsv(file, username)));
    }

    @Operation(summary = "Update managed student",
            description = "Updates an existing student profile managed by the college administrator.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Student updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student not found")
    })
    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> updateManagedStudent(
            @Parameter(description = "Student ID") @PathVariable Long id,
            @Valid @RequestBody StudentDTO studentDTO,
            Authentication authentication) {
        studentDTO.setId(id);
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Student updated successfully",
                studentService.createOrUpdateManagedStudent(studentDTO, username)));
    }

    @Operation(summary = "Notify eligible scholarships for a student",
            description = "Triggers eligibility check and sends notifications for all matching scholarships.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notifications triggered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student not found")
    })
    @PostMapping("/students/{id}/notify-eligible")
    public ResponseEntity<ApiResponse<CollegeEligibilityResultDTO>> notifyEligibleForStudent(
            @Parameter(description = "Student ID") @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Eligibility notifications triggered",
                studentService.notifyEligibleScholarshipsForManagedStudent(id, username)));
    }

    @Operation(summary = "Notify eligible scholarships for all students",
            description = "Triggers eligibility check and sends notifications for all managed students.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notifications triggered for all students")
    })
    @PostMapping("/students/notify-eligible-all")
    public ResponseEntity<ApiResponse<List<CollegeEligibilityResultDTO>>> notifyEligibleForAll(
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(
                "Eligibility notifications triggered for all managed students",
                studentService.notifyEligibleScholarshipsForAllManagedStudents(username)));
    }
}

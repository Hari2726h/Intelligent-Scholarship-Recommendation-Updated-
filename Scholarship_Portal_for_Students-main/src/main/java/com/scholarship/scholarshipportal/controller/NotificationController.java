package com.scholarship.scholarshipportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.dto.NotificationDTO;
import com.scholarship.scholarshipportal.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Notifications", description = "User notification management APIs")
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "Get my notifications",
            description = "Returns all notifications for the authenticated user, ordered by creation date.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notifications fetched successfully")
    })
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getMyNotifications(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully",
                notificationService.getMyNotifications(username)));
    }

    @Operation(summary = "Get unread notification count",
            description = "Returns the count of unread notifications for the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Unread count fetched")
    })
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched successfully",
                notificationService.getUnreadCount(username)));
    }

    @Operation(summary = "Mark notification as read",
            description = "Marks a specific notification as read for the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification marked as read"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @PutMapping("/read/{id}")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @Parameter(description = "Notification ID") @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        notificationService.markAsRead(id, username);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read successfully", null));
    }

    @Operation(summary = "Mark all notifications as read",
            description = "Marks all notifications as read for the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All notifications marked as read")
    })
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        String username = authentication.getName();
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read successfully", null));
    }

    @Operation(summary = "Delete a notification",
            description = "Permanently deletes a notification for the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @Parameter(description = "Notification ID") @PathVariable Long id,
            Authentication authentication) {
        String username = authentication.getName();
        notificationService.deleteNotification(id, username);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
    }
}

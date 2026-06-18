package com.scholarship.scholarshipportal.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Production-grade error response structure.
 * 
 * Follows RFC 7807 (Problem Details for HTTP APIs) conventions.
 * Used by GlobalExceptionHandler to provide consistent error responses.
 *
 * Example response:
 * {
 *   "timestamp": "2026-06-18T12:30:00",
 *   "status": 400,
 *   "error": "BAD_REQUEST",
 *   "message": "Validation failed",
 *   "path": "/auth/register",
 *   "errors": ["email: must be a valid email address"]
 * }
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<String> errors;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
        this.errors = new ArrayList<>();
    }

    public ErrorResponse(int status, String error, String message, String path) {
        this();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // Legacy constructors — maintained for backward compatibility
    public ErrorResponse(String message) {
        this();
        this.message = message;
    }

    public ErrorResponse(String message, List<String> errors) {
        this(message);
        this.errors = errors;
    }

    public ErrorResponse(String message, String path) {
        this(message);
        this.path = path;
    }

    public void addError(String error) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(error);
    }

    // Getters and Setters
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
}

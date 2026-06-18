package com.scholarship.scholarshipportal.exception;

import com.scholarship.scholarshipportal.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.ArrayList;
import java.util.List;

/**
 * Production-Grade Global Exception Handler.
 * 
 * Centralizes all exception handling across the application, ensuring:
 * 1. Consistent error response format for all API consumers
 * 2. Structured logging for monitoring and alerting
 * 3. No sensitive information leaked in error responses
 * 4. Proper HTTP status codes for each error type
 *
 * Response Format:
 * {
 *   "timestamp": "2026-06-18T12:30:00",
 *   "status": 400,
 *   "error": "BAD_REQUEST",
 *   "message": "Human-readable message",
 *   "path": "/api/endpoint",
 *   "errors": ["field-level errors if applicable"]
 * }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==================== 404 — NOT FOUND ====================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // ==================== 401 — UNAUTHORIZED ====================

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex, WebRequest request) {
        log.warn("Unauthorized access attempt: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // ==================== 403 — FORBIDDEN ====================

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        log.warn("Access denied: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleSpringAccessDenied(
            org.springframework.security.access.AccessDeniedException ex, WebRequest request) {
        log.warn("Spring Security access denied: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied. You do not have permission to perform this action.", request);
    }

    // ==================== 409 — CONFLICT ====================

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserExists(UserAlreadyExistsException ex, WebRequest request) {
        log.warn("User already exists: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(DuplicateResourceException ex, WebRequest request) {
        log.warn("Duplicate resource: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // ==================== 400 — BAD REQUEST ====================

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFile(InvalidFileException ex, WebRequest request) {
        log.warn("Invalid file upload: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        List<String> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
        }
        log.warn("Validation failed: {} | path={}", errors, getPath(request));

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed",
                getPath(request)
        );
        errorResponse.setErrors(errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        log.warn("Illegal argument: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJson(HttpMessageNotReadableException ex, WebRequest request) {
        log.warn("Malformed JSON request: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.BAD_REQUEST, "Malformed JSON request body. Please check your request format.", request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex, WebRequest request) {
        log.warn("Missing request parameter: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.BAD_REQUEST,
                "Required parameter '" + ex.getParameterName() + "' is missing.", request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        log.warn("Type mismatch: parameter={}, value={} | path={}", ex.getName(), ex.getValue(), getPath(request));
        return buildResponse(HttpStatus.BAD_REQUEST,
                "Parameter '" + ex.getName() + "' must be of type " +
                        (ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown"), request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex, WebRequest request) {
        log.warn("File upload size exceeded: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.BAD_REQUEST, "File size exceeds the maximum allowed limit of 5MB.", request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        log.error("Database integrity violation: {} | path={}", ex.getMessage(), getPath(request));
        return buildResponse(HttpStatus.CONFLICT,
                "Database constraint violation. The operation conflicts with existing data.", request);
    }

    // ==================== 500 — INTERNAL SERVER ERROR ====================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex, WebRequest request) {
        log.error("Runtime exception: {} | path={}", ex.getMessage(), getPath(request), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        log.error("Unhandled exception: {} | path={}", ex.getMessage(), getPath(request), ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error. Please contact support if the issue persists.", request);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Builds a standardized ErrorResponse with consistent structure.
     */
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                message,
                getPath(request)
        );
        return ResponseEntity.status(status).body(error);
    }

    /**
     * Extracts the request path from WebRequest.
     * Removes the "uri=" prefix from WebRequest.getDescription().
     */
    private String getPath(WebRequest request) {
        String description = request.getDescription(false);
        return description.replace("uri=", "");
    }
}

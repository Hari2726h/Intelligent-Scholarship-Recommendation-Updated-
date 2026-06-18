package com.scholarship.scholarshipportal.exception;

/**
 * Exception thrown when file upload validation fails
 */
public class InvalidFileException extends RuntimeException {
    public InvalidFileException(String message) {
        super(message);
    }
}

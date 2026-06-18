package com.scholarship.scholarshipportal.dto;

/**
 * DTO for file upload response
 */
public class FileUploadDTO {
    private Long id;
    private String fileName;
    private String documentType;
    private Long fileSize;
    private String message;

    // Constructors
    public FileUploadDTO() {}

    public FileUploadDTO(Long id, String fileName, String documentType, Long fileSize, String message) {
        this.id = id;
        this.fileName = fileName;
        this.documentType = documentType;
        this.fileSize = fileSize;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

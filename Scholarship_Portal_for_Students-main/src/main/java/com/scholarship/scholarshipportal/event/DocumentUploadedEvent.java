package com.scholarship.scholarshipportal.event;

/**
 * Event published when a student uploads a document.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Document uploads trigger:
 * 1. Audit log ("Student X uploaded transcript")
 * 2. Notification to student ("Document uploaded successfully")
 * 3. Profile completeness recalculation (for recommendation engine)
 *
 * KAFKA CONCEPTS:
 * - Topic: "application-events" (documents are part of the application lifecycle)
 * - Key: studentId (for student-level ordering of document events)
 *
 * INTERVIEW QUESTIONS:
 * 1. Why not store the actual file in the event? → Events should be lightweight metadata.
 *    The file is stored in the filesystem/S3. The event carries the file path/reference.
 * 2. What if the file upload succeeds but the event publish fails? → The file is already saved.
 *    An outbox pattern or a scheduled job can reconcile missing events.
 */
public class DocumentUploadedEvent extends BaseEvent {

    private Long documentId;
    private Long studentId;
    private String studentName;
    private String username;
    private String fileName;
    private String documentType;
    private Long fileSize;

    public DocumentUploadedEvent() {
        super();
    }

    public DocumentUploadedEvent(Long documentId, Long studentId, String studentName,
                                  String username, String fileName, String documentType,
                                  Long fileSize) {
        super();
        this.documentId = documentId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.username = username;
        this.fileName = fileName;
        this.documentType = documentType;
        this.fileSize = fileSize;
    }

    // Getters and Setters
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    @Override
    public String toString() {
        return "DocumentUploadedEvent{" +
                "documentId=" + documentId +
                ", studentId=" + studentId +
                ", fileName='" + fileName + '\'' +
                "} " + super.toString();
    }
}

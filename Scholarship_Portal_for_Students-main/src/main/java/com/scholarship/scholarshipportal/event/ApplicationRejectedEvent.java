package com.scholarship.scholarshipportal.event;

/**
 * Event published when an admin rejects a scholarship application.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Rejection triggers the same set of downstream actions as approval but with different content:
 * 1. Notification: "Your application for X was not approved"
 * 2. Email: Rejection email with encouragement to apply for other scholarships
 * 3. Audit: "REJECT action by admin X"
 * 4. Analytics: Increment rejected counter
 *
 * INTERVIEW QUESTIONS:
 * 1. Should rejection reason be included? → Yes, in production you'd add a 'reason' field
 *    so the student knows why. This is a good extensibility point.
 * 2. Why separate event instead of a generic StatusChangedEvent? → Explicit event types
 *    make consumers clearer and avoid switch statements. CQRS/ES best practice.
 */
public class ApplicationRejectedEvent extends BaseEvent {

    private Long applicationId;
    private Long scholarshipId;
    private String scholarshipTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String rejectedBy;
    private String reason;

    public ApplicationRejectedEvent() {
        super();
    }

    public ApplicationRejectedEvent(Long applicationId, Long scholarshipId, String scholarshipTitle,
                                     Long studentId, String studentName, String studentEmail,
                                     String rejectedBy, String reason) {
        super();
        this.applicationId = applicationId;
        this.scholarshipId = scholarshipId;
        this.scholarshipTitle = scholarshipTitle;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.rejectedBy = rejectedBy;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public Long getScholarshipId() { return scholarshipId; }
    public void setScholarshipId(Long scholarshipId) { this.scholarshipId = scholarshipId; }
    public String getScholarshipTitle() { return scholarshipTitle; }
    public void setScholarshipTitle(String scholarshipTitle) { this.scholarshipTitle = scholarshipTitle; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    @Override
    public String toString() {
        return "ApplicationRejectedEvent{" +
                "applicationId=" + applicationId +
                ", scholarshipTitle='" + scholarshipTitle + '\'' +
                ", rejectedBy='" + rejectedBy + '\'' +
                "} " + super.toString();
    }
}

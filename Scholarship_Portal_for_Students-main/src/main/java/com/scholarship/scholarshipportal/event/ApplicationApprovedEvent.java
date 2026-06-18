package com.scholarship.scholarshipportal.event;

/**
 * Event published when an admin approves a scholarship application.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Approval triggers:
 * 1. Notification to the student ("Congratulations! Your application was approved")
 * 2. Email with approval details
 * 3. Audit log ("APPROVE action by admin X on application Y")
 * 4. Analytics update (increment approved counter)
 * 5. Cache invalidation (analytics dashboard cache must be refreshed)
 *
 * KAFKA CONCEPTS:
 * - Topic: "application-events" (same topic as submitted, different event type)
 * - Consumer differentiation: Consumers check the event type to handle accordingly
 * - Ordering: Same applicationId key → same partition → ordered processing
 *
 * INTERVIEW QUESTIONS:
 * 1. Why same topic as ApplicationSubmittedEvent? → They're both application lifecycle events.
 *    Using the same topic with the same key (applicationId) guarantees that SUBMITTED is always
 *    processed before APPROVED for the same application.
 * 2. What if a consumer receives an APPROVED event before SUBMITTED? → With proper key-based
 *    partitioning and sequential processing, this won't happen. But consumers should be
 *    designed to handle out-of-order events gracefully (idempotency).
 */
public class ApplicationApprovedEvent extends BaseEvent {

    private Long applicationId;
    private Long scholarshipId;
    private String scholarshipTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String approvedBy;

    public ApplicationApprovedEvent() {
        super();
    }

    public ApplicationApprovedEvent(Long applicationId, Long scholarshipId, String scholarshipTitle,
                                     Long studentId, String studentName, String studentEmail,
                                     String approvedBy) {
        super();
        this.applicationId = applicationId;
        this.scholarshipId = scholarshipId;
        this.scholarshipTitle = scholarshipTitle;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.approvedBy = approvedBy;
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
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    @Override
    public String toString() {
        return "ApplicationApprovedEvent{" +
                "applicationId=" + applicationId +
                ", scholarshipTitle='" + scholarshipTitle + '\'' +
                ", approvedBy='" + approvedBy + '\'' +
                "} " + super.toString();
    }
}

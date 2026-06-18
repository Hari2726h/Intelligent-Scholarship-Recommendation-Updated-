package com.scholarship.scholarshipportal.event;

import java.math.BigDecimal;

/**
 * Event published when a student submits a scholarship application.
 *
 * WHY THIS EXISTS:
 * ----------------
 * When a student applies for a scholarship, multiple downstream actions must happen:
 * 1. Save a notification for the student ("Your application was submitted")
 * 2. Send a confirmation email
 * 3. Log an audit trail entry
 * 4. Update analytics counters
 *
 * Previously, all of these happened synchronously in ApplicationService.apply().
 * Now, the service publishes this event to Kafka's "application-events" topic,
 * and dedicated consumers handle each concern independently.
 *
 * BENEFITS:
 * - API response time drops from ~500ms to ~50ms (fire-and-forget to Kafka)
 * - If the email service is down, the application still succeeds
 * - Consumers can be scaled independently (e.g., 5 email consumers, 1 audit consumer)
 *
 * KAFKA CONCEPTS:
 * - Topic: "application-events"
 * - Key: applicationId (ensures all events for the same application go to the same partition)
 * - Partition ordering: Events for the same application are processed in order
 *
 * INTERVIEW QUESTIONS:
 * 1. Why not just call NotificationService directly? → Tight coupling. If notification
 *    service is slow/down, it blocks the application submission. With Kafka, the API returns
 *    immediately and the notification is processed asynchronously.
 * 2. What if the Kafka publish fails? → The application is saved to the database first
 *    (transactional). The Kafka publish is best-effort. We can add an outbox pattern for
 *    guaranteed delivery.
 * 3. How do you ensure the event matches the database state? → The event is published AFTER
 *    the database transaction commits. If the transaction rolls back, no event is published.
 */
public class ApplicationSubmittedEvent extends BaseEvent {

    private Long applicationId;
    private Long scholarshipId;
    private String scholarshipTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String username;
    private BigDecimal scholarshipAmount;

    public ApplicationSubmittedEvent() {
        super();
    }

    public ApplicationSubmittedEvent(Long applicationId, Long scholarshipId, String scholarshipTitle,
                                      Long studentId, String studentName, String studentEmail,
                                      String username, BigDecimal scholarshipAmount) {
        super();
        this.applicationId = applicationId;
        this.scholarshipId = scholarshipId;
        this.scholarshipTitle = scholarshipTitle;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.username = username;
        this.scholarshipAmount = scholarshipAmount;
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
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public BigDecimal getScholarshipAmount() { return scholarshipAmount; }
    public void setScholarshipAmount(BigDecimal scholarshipAmount) { this.scholarshipAmount = scholarshipAmount; }

    @Override
    public String toString() {
        return "ApplicationSubmittedEvent{" +
                "applicationId=" + applicationId +
                ", scholarshipTitle='" + scholarshipTitle + '\'' +
                ", username='" + username + '\'' +
                "} " + super.toString();
    }
}

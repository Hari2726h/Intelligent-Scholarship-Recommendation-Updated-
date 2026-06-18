package com.scholarship.scholarshipportal.event;

/**
 * Event published when a new user registers in the system.
 *
 * WHY THIS EXISTS:
 * ----------------
 * User registration triggers:
 * 1. Welcome email (currently done synchronously in AuthService)
 * 2. Audit log entry
 * 3. Analytics update (user count)
 * 4. Cache invalidation (analytics dashboard)
 *
 * By publishing this event, AuthService.register() becomes faster because it no longer
 * waits for the email to be sent (which can take 1-3 seconds with SMTP).
 *
 * KAFKA CONCEPTS:
 * - Topic: "user-events"
 * - Key: username (for user-level ordering)
 *
 * INTERVIEW QUESTIONS:
 * 1. What if the email fails to send after registration? → With Kafka, the event is persisted.
 *    If the email consumer fails, Kafka retries. The user's registration is never affected.
 * 2. What about the welcome email latency? → The user sees "Registration successful" immediately.
 *    The email arrives asynchronously, typically within seconds.
 */
public class UserRegisteredEvent extends BaseEvent {

    private Long userId;
    private String username;
    private String email;
    private String role;

    public UserRegisteredEvent() {
        super();
    }

    public UserRegisteredEvent(Long userId, String username, String email, String role) {
        super();
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    @Override
    public String toString() {
        return "UserRegisteredEvent{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                "} " + super.toString();
    }
}

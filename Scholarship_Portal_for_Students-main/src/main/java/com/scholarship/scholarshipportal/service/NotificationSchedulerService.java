package com.scholarship.scholarshipportal.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.scholarship.scholarshipportal.entity.Application;
import com.scholarship.scholarshipportal.entity.Notification;
import com.scholarship.scholarshipportal.entity.Notification.NotificationType;
import com.scholarship.scholarshipportal.entity.Scholarship;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.repository.ApplicationRepository;
import com.scholarship.scholarshipportal.repository.NotificationRepository;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;

/**
 * Service for generating static notifications based on user applications
 */
@Service
public class NotificationSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationSchedulerService.class);

    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    public NotificationSchedulerService(
            StudentRepository studentRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            ApplicationRepository applicationRepository) {
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    /**
     * Generate static notifications for user's applications (sorted by nearest deadline)
     * This replaces scheduled notifications with on-demand static notifications
     */
    @Transactional
    public void generateApplicationDeadlineNotifications(String username) {
        logger.info("Generating deadline notifications for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElse(null);

        if (student == null) {
            logger.warn("No student profile found for user: {}", username);
            return;
        }

        // Get all applications for this student
        List<Application> applications = applicationRepository.findByStudent(student);

        if (applications.isEmpty()) {
            // Create a welcome notification if no applications
            Notification welcomeNotification = new Notification();
            welcomeNotification.setUser(user);
            welcomeNotification.setMessage("Welcome! Start exploring scholarships and apply to opportunities that match your profile.");
            welcomeNotification.setNotificationType(NotificationType.GENERAL);
            notificationRepository.save(welcomeNotification);
            return;
        }

        // Sort applications by deadline (nearest first)
        LocalDate today = LocalDate.now();
        List<Application> upcomingApplications = applications.stream()
                .filter(app -> app.getScholarship() != null)
                .filter(app -> app.getScholarship().getDeadline() != null)
                .filter(app -> app.getScholarship().getDeadline().isAfter(today))
                .sorted(Comparator.comparing(app -> app.getScholarship().getDeadline()))
                .toList();

        // Clear old deadline notifications for this user
        List<Notification> existingNotifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        existingNotifications.stream()
                .filter(n -> n.getNotificationType() == NotificationType.DEADLINE_REMINDER)
                .forEach(notificationRepository::delete);

        // Generate new notifications for upcoming deadlines
        for (Application app : upcomingApplications) {
            Scholarship scholarship = app.getScholarship();
            long daysUntilDeadline = ChronoUnit.DAYS.between(today, scholarship.getDeadline());

            String message;
            if (daysUntilDeadline <= 3) {
                message = String.format("🔴 URGENT: '%s' deadline is in %d days (%s)! Complete your application now.",
                        scholarship.getTitle(), daysUntilDeadline, scholarship.getDeadline());
            } else if (daysUntilDeadline <= 7) {
                message = String.format("⏰ Reminder: '%s' deadline is in %d days (%s). Don't miss out!",
                        scholarship.getTitle(), daysUntilDeadline, scholarship.getDeadline());
            } else {
                message = String.format("📅 '%s' deadline is %s (%d days remaining).",
                        scholarship.getTitle(), scholarship.getDeadline(), daysUntilDeadline);
            }

            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(message);
            notification.setNotificationType(NotificationType.DEADLINE_REMINDER);
            notification.setScholarshipId(scholarship.getId());
            notification.setActionLink(scholarship.getApplicationLink());

            notificationRepository.save(notification);
        }

        logger.info("Generated {} deadline notifications for user: {}", upcomingApplications.size(), username);
    }
}

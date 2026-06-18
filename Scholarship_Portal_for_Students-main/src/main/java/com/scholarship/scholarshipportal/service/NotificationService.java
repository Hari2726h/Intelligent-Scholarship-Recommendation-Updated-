package com.scholarship.scholarshipportal.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.scholarship.scholarshipportal.dto.CollegeNotificationItemDTO;
import com.scholarship.scholarshipportal.dto.CollegeStudentNotificationGroupDTO;
import com.scholarship.scholarshipportal.dto.NotificationDTO;
import com.scholarship.scholarshipportal.entity.Notification;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.entity.Notification.NotificationType;
import com.scholarship.scholarshipportal.repository.NotificationRepository;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;
import com.scholarship.scholarshipportal.util.DtoMapper;
import com.scholarship.scholarshipportal.util.ScholarshipLinkUtils;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final NotificationSchedulerService notificationSchedulerService;

    public NotificationService(NotificationRepository notificationRepository, 
                             UserRepository userRepository,
                             StudentRepository studentRepository,
                             NotificationSchedulerService notificationSchedulerService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.notificationSchedulerService = notificationSchedulerService;
    }

    public List<NotificationDTO> getMyNotifications(String username) {
        // Auto-generate/refresh notifications based on applications
        notificationSchedulerService.generateApplicationDeadlineNotifications(username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(DtoMapper::mapToNotificationDTO)
                .collect(Collectors.toList());
    }

    public void markAsRead(Long id, String username) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to update this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(n -> !n.getIsRead())
                .count();
    }

    public void deleteNotification(Long id, String username) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    public void createNotificationForUser(User user,
                                          String message,
                                          NotificationType notificationType,
                                          Long scholarshipId,
                                          String actionLink) {
        createNotificationForUser(user, message, notificationType, scholarshipId, actionLink, null, null, null);
    }

    public void createNotificationForUser(User user,
                                          String message,
                                          NotificationType notificationType,
                                          Long scholarshipId,
                                          String actionLink,
                                          Long studentId,
                                          String studentName,
                                          String studentEmail) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setScholarshipId(scholarshipId);
        notification.setStudentId(studentId);
        notification.setStudentName(studentName);
        notification.setStudentEmail(studentEmail);
        notification.setActionLink(ScholarshipLinkUtils.normalize(actionLink, null));
        notificationRepository.save(notification);
    }

    public List<CollegeStudentNotificationGroupDTO> getCollegeNotificationsGroupedByStudent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        Map<String, List<Notification>> grouped = notifications.stream()
                .filter(notification -> notification.getNotificationType() == NotificationType.ELIGIBILITY_ALERT)
                .collect(Collectors.groupingBy(this::notificationGroupKey, LinkedHashMap::new, Collectors.toList()));

        return grouped.values().stream().map(group -> {
            Notification first = group.get(0);
            Student resolvedStudent = resolveStudent(first);
            String studentName = resolveStudentName(first, resolvedStudent);
            String studentEmail = resolveStudentEmail(first, resolvedStudent);

            List<CollegeNotificationItemDTO> items = group.stream()
                    .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                    .collect(Collectors.toMap(
                            this::notificationScholarshipKey,
                            notification -> notification,
                            (left, right) -> left,
                            LinkedHashMap::new))
                    .values()
                    .stream()
                    .map(notification -> {
                CollegeNotificationItemDTO item = new CollegeNotificationItemDTO();
                item.setId(notification.getId());
                item.setMessage(notification.getMessage());
                item.setNotificationType(notification.getNotificationType() != null
                        ? notification.getNotificationType().name()
                        : null);
                item.setIsRead(notification.getIsRead());
                item.setScholarshipId(notification.getScholarshipId());
                item.setScholarshipTitle(extractScholarshipTitle(notification.getMessage()));
                item.setActionLink(ScholarshipLinkUtils.normalize(notification.getActionLink(), null));
                item.setCreatedAt(notification.getCreatedAt());
                return item;
            }).toList();

            CollegeStudentNotificationGroupDTO dto = new CollegeStudentNotificationGroupDTO();
            dto.setStudentId(first.getStudentId());
            dto.setStudentName(studentName);
            dto.setStudentEmail(studentEmail);
            dto.setTotalNotifications(items.size());
            dto.setUnreadNotifications(items.stream().filter(item -> !Boolean.TRUE.equals(item.getIsRead())).count());
            dto.setNotifications(items);
            return dto;
        }).toList();
    }

    private Student resolveStudent(Notification notification) {
        if (notification.getStudentId() == null) {
            return null;
        }

        return studentRepository.findById(notification.getStudentId()).orElse(null);
    }

    private String resolveStudentName(Notification notification, Student student) {
        if (notification.getStudentName() != null && !notification.getStudentName().isBlank()) {
            return notification.getStudentName();
        }
        if (student != null && student.getName() != null && !student.getName().isBlank()) {
            return student.getName();
        }
        if (notification.getMessage() != null) {
            int marker = notification.getMessage().indexOf(" is eligible for ");
            if (marker > 0) {
                return notification.getMessage().substring(0, marker).trim();
            }
        }
        return "Unknown Student";
    }

    private String resolveStudentEmail(Notification notification, Student student) {
        if (notification.getStudentEmail() != null && !notification.getStudentEmail().isBlank()) {
            return notification.getStudentEmail();
        }
        if (student != null && student.getContactEmail() != null && !student.getContactEmail().isBlank()) {
            return student.getContactEmail();
        }
        return null;
    }

    private String notificationScholarshipKey(Notification notification) {
        if (notification.getScholarshipId() != null) {
            return "scholarship-" + notification.getScholarshipId();
        }
        return Objects.toString(extractScholarshipTitle(notification.getMessage()), notification.getMessage());
    }

    private String extractScholarshipTitle(String message) {
        if (message == null || message.isBlank()) {
            return "Scholarship";
        }
        int marker = message.indexOf(" is eligible for ");
        if (marker >= 0) {
            return message.substring(marker + " is eligible for ".length()).trim();
        }
        return message.trim();
    }

    private String notificationGroupKey(Notification notification) {
        if (notification.getStudentId() != null) {
            return "id-" + notification.getStudentId();
        }
        if (notification.getStudentName() != null && !notification.getStudentName().isBlank()) {
            return "name-" + notification.getStudentName().trim().toLowerCase();
        }
        return "unknown";
    }
}

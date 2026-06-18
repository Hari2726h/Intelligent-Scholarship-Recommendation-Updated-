package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.dto.ApplicationDTO;
import com.scholarship.scholarshipportal.entity.*;
import com.scholarship.scholarshipportal.entity.Application.Status;
import com.scholarship.scholarshipportal.exception.DuplicateResourceException;
import com.scholarship.scholarshipportal.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ApplicationService
 */
@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ScholarshipRepository scholarshipRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ApplicationStatusHistoryRepository historyRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ApplicationService applicationService;

    private User testUser;
    private Student testStudent;
    private Scholarship testScholarship;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("teststudent");
        testUser.setEmail("student@test.com");
        testUser.setRole("STUDENT");

        // Setup test data
        testStudent = new Student();
        testStudent.setId(1L);
        testStudent.setName("Test Student");
        testStudent.setUser(testUser);
        testStudent.setCgpa(3.5);
        testStudent.setAnnualIncome(new BigDecimal("40000.0"));

        testScholarship = new Scholarship();
        testScholarship.setId(1L);
        testScholarship.setTitle("Test Scholarship");
        testScholarship.setAmount(new BigDecimal("5000.0"));
        testScholarship.setDeadline(LocalDate.now().plusDays(30));
        testScholarship.setIsActive(true);
        testScholarship.setIsDeleted(false);

        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setStudent(testStudent);
        testApplication.setScholarship(testScholarship);
        testApplication.setStatus(Status.PENDING);
    }

    @Test
    void testApply_Success() {
        // Arrange
        when(userRepository.findByUsername("teststudent")).thenReturn(Optional.of(testUser));
        when(studentRepository.findByUser(testUser)).thenReturn(Optional.of(testStudent));
        when(scholarshipRepository.findById(1L)).thenReturn(Optional.of(testScholarship));
        when(applicationRepository.existsByStudentAndScholarship(testStudent, testScholarship)).thenReturn(false);
        when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

        // Act
        ApplicationDTO result = applicationService.apply(1L, "teststudent");

        // Assert
        assertNotNull(result);
        assertEquals(Status.PENDING, result.getStatus());
        verify(applicationRepository, times(1)).save(any(Application.class));
        verify(historyRepository, times(1)).save(any(ApplicationStatusHistory.class));
        verify(auditService, times(1)).logAction(anyString(), anyString(), anyString(), any(), anyString());
    }

    @Test
    void testApply_AlreadyApplied() {
        // Arrange
        when(userRepository.findByUsername("teststudent")).thenReturn(Optional.of(testUser));
        when(studentRepository.findByUser(testUser)).thenReturn(Optional.of(testStudent));
        when(scholarshipRepository.findById(1L)).thenReturn(Optional.of(testScholarship));
        when(applicationRepository.existsByStudentAndScholarship(testStudent, testScholarship)).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class, () -> {
            applicationService.apply(1L, "teststudent");
        });
    }

    // Tests for updateStatus() method removed as admin approve/disapprove functionality was removed
    // as per requirement: admin cannot have power to approve/reject scholarships in intermediary platform
}

package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.dto.ScholarshipDTO;
import com.scholarship.scholarshipportal.entity.Scholarship;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.exception.ResourceNotFoundException;
import com.scholarship.scholarshipportal.repository.ScholarshipRepository;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ScholarshipService
 */
@ExtendWith(MockitoExtension.class)
class ScholarshipServiceTest {

    @Mock
    private ScholarshipRepository scholarshipRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ScholarshipService scholarshipService;

    private User testUser;
    private Scholarship testScholarship;
    private ScholarshipDTO testScholarshipDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("admin");
        testUser.setEmail("admin@test.com");
        testUser.setRole("ADMIN");

        testScholarship = new Scholarship();
        testScholarship.setId(1L);
        testScholarship.setTitle("Merit Scholarship");
        testScholarship.setDescription("For high achievers");
        testScholarship.setAmount(new BigDecimal("10000.0"));
        testScholarship.setCategory("Academic");
        testScholarship.setMinCgpa(3.5);
        testScholarship.setMaxIncome(new BigDecimal("50000.0"));
        testScholarship.setDeadline(LocalDate.now().plusMonths(3));
        testScholarship.setIsActive(true);
        testScholarship.setIsDeleted(false);

        testScholarshipDTO = new ScholarshipDTO();
        testScholarshipDTO.setTitle("Merit Scholarship");
        testScholarshipDTO.setDescription("For high achievers");
        testScholarshipDTO.setAmount(new BigDecimal("10000.0"));
        testScholarshipDTO.setCategory("Academic");
        testScholarshipDTO.setMinCgpa(3.5);
        testScholarshipDTO.setMaxIncome(new BigDecimal("50000.0"));
        testScholarshipDTO.setDeadline(LocalDate.now().plusMonths(3));
    }

    @Test
    void testCreateScholarship_Success() {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testUser));
        when(scholarshipRepository.save(any(Scholarship.class))).thenReturn(testScholarship);

        // Act
        ScholarshipDTO result = scholarshipService.createScholarship(testScholarshipDTO, "admin");

        // Assert
        assertNotNull(result);
        assertEquals("Merit Scholarship", result.getTitle());
        verify(scholarshipRepository, times(1)).save(any(Scholarship.class));
        verify(auditService, times(1)).logAction(anyString(), anyString(), anyString(), any(), anyString());
    }

    @Test
    void testGetAllScholarships() {
        // Arrange
        List<Scholarship> mockScholarships = Arrays.asList(testScholarship);
        Page<Scholarship> page = new PageImpl<>(mockScholarships);
        Pageable pageable = PageRequest.of(0, 10);
        when(scholarshipRepository.findAllByIsDeletedFalse(pageable)).thenReturn(page);

        // Act
        Page<ScholarshipDTO> result = scholarshipService.getAllScholarships(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Merit Scholarship", result.getContent().get(0).getTitle());
    }

    @Test
    void testDeleteScholarship_Success() {
        // Arrange
        when(scholarshipRepository.findById(1L)).thenReturn(Optional.of(testScholarship));
        when(scholarshipRepository.save(any(Scholarship.class))).thenReturn(testScholarship);

        // Act
        scholarshipService.deleteScholarship(1L);

        // Assert
        assertTrue(testScholarship.getIsDeleted());
        assertFalse(testScholarship.getIsActive());
        verify(scholarshipRepository, times(1)).save(any(Scholarship.class));
        verify(auditService, times(1)).logAction(anyString(), anyString(), anyString(), any(), anyString());
    }

    @Test
    void testDeleteScholarship_NotFound() {
        // Arrange
        when(scholarshipRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            scholarshipService.deleteScholarship(999L);
        });
    }
}

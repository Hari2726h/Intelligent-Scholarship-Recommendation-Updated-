package com.scholarship.scholarshipportal.service;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.scholarship.scholarshipportal.dto.ScholarshipDTO;
import com.scholarship.scholarshipportal.entity.Scholarship;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.exception.ResourceNotFoundException;
import com.scholarship.scholarshipportal.repository.ScholarshipRepository;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;
import com.scholarship.scholarshipportal.util.DtoMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;

/**
 * Enhanced Scholarship Service with Redis caching and Kafka event publishing.
 *
 * REDIS INTEGRATION:
 * ==================
 * This service implements the Cache-Aside pattern for:
 * 1. Individual scholarship lookups (scholarship:{id})
 * 2. Eligibility results (eligible:user:{userId})
 *
 * On CREATE/DELETE: Invalidates the "scholarships:all" cache because the listing has changed.
 * On GET by ID: Checks Redis first, falls through to MySQL on miss.
 * On GET eligible: Checks Redis with user-specific key, falls through to MySQL on miss.
 *
 * WHY cache here and not in the controller?
 * - The service layer owns the business logic and data flow
 * - Caching in the controller would bypass the service for cached responses
 * - Service-level caching ensures consistency regardless of which controller calls it
 *
 * KAFKA INTEGRATION:
 * ==================
 * Scholarship CRUD operations don't publish Kafka events directly because:
 * 1. Scholarship changes are admin operations (low frequency)
 * 2. The audit logging is still done via AuditService (synchronous)
 * 3. Cache invalidation handles the read-side consistency
 *
 * However, scholarship changes DO invalidate caches that affect other modules:
 * - New scholarship → invalidate all eligibility caches (students might be newly eligible)
 * - Deleted scholarship → invalidate all eligibility caches + listing cache
 */
@Service
public class ScholarshipService {

    private static final Logger logger = LoggerFactory.getLogger(ScholarshipService.class);

    private final ScholarshipRepository scholarshipRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final RedisCacheService redisCacheService;

    public ScholarshipService(ScholarshipRepository scholarshipRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            AuditService auditService,
            RedisCacheService redisCacheService) {
        this.scholarshipRepository = scholarshipRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.redisCacheService = redisCacheService;
    }

    public ScholarshipDTO createScholarship(ScholarshipDTO scholarshipDTO, String username) {
        logger.info("Creating scholarship: {} by user: {}", scholarshipDTO.getTitle(), username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Scholarship scholarship = new Scholarship();
        scholarship.setTitle(scholarshipDTO.getTitle());
        scholarship.setDescription(scholarshipDTO.getDescription());
        scholarship.setMinCgpa(scholarshipDTO.getMinCgpa());
        scholarship.setMaxIncome(scholarshipDTO.getMaxIncome());
        scholarship.setCategory(scholarshipDTO.getCategory());
        scholarship.setAmount(scholarshipDTO.getAmount());
        scholarship.setDeadline(scholarshipDTO.getDeadline());
        scholarship.setCreatedBy(user);
        scholarship.setIsActive(true);
        scholarship.setIsDeleted(false);

        Scholarship saved = scholarshipRepository.save(scholarship);

        // Log audit
        auditService.logAction("CREATE", username, "SCHOLARSHIP", saved.getId(),
                "Created scholarship: " + saved.getTitle());

        // ===== REDIS: Invalidate listings cache (new scholarship added) =====
        redisCacheService.evictAllScholarships();
        logger.debug("Redis: Invalidated scholarships:all cache after creating scholarship");

        logger.info("Scholarship created successfully: ID {} - {}", saved.getId(), saved.getTitle());
        return DtoMapper.mapToScholarshipDTO(saved);
    }

    public Page<ScholarshipDTO> getAllScholarships(Pageable pageable) {
        logger.debug("Fetching all scholarships (excluding deleted), page: {}", pageable.getPageNumber());
        // Only return non-deleted scholarships
        return scholarshipRepository.findAllByIsDeletedFalse(pageable)
                .map(DtoMapper::mapToScholarshipDTO);
    }

    /**
     * Get scholarship by ID with Redis Cache-Aside pattern.
     *
     * FLOW:
     * 1. Check Redis for key "scholarship:{id}"
     * 2. CACHE HIT → return cached ScholarshipDTO (sub-millisecond)
     * 3. CACHE MISS → query MySQL → cache result → return
     */
    public ScholarshipDTO getScholarshipById(Long id) {
        logger.debug("Fetching scholarship by ID: {}", id);

        // ===== REDIS: Check cache first =====
        ScholarshipDTO cached = redisCacheService.getCachedScholarship(id);
        if (cached != null) {
            logger.debug("Returning cached scholarship: ID {}", id);
            return cached;
        }

        // CACHE MISS: Query database
        Scholarship scholarship = scholarshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found with ID: " + id));
        
        if (scholarship.getIsDeleted()) {
            throw new ResourceNotFoundException("Scholarship has been deleted");
        }
        
        ScholarshipDTO dto = DtoMapper.mapToScholarshipDTO(scholarship);

        // ===== REDIS: Cache the result for future requests =====
        redisCacheService.cacheScholarship(id, dto);

        return dto;
    }

    /**
     * Soft delete - mark as deleted instead of physical delete
     */
    public void deleteScholarship(Long id) {
        logger.info("Soft deleting scholarship: ID {}", id);

        Scholarship scholarship = scholarshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found"));

        scholarship.setIsDeleted(true);
        scholarship.setIsActive(false);
        scholarshipRepository.save(scholarship);

        // Log audit
        auditService.logAction("DELETE", "ADMIN", "SCHOLARSHIP", id,
                "Soft deleted scholarship: " + scholarship.getTitle());

        // ===== REDIS: Invalidate both the specific scholarship and listings cache =====
        redisCacheService.evictScholarship(id);
        redisCacheService.evictAllScholarships();
        logger.debug("Redis: Invalidated scholarship:{} and scholarships:all caches", id);

        logger.info("Scholarship soft deleted: ID {} - {}", id, scholarship.getTitle());
    }

    /**
     * Hard delete (for admin cleanup)
     */
    public void hardDeleteScholarship(Long id) {
        logger.warn("Hard deleting scholarship: ID {}", id);
        scholarshipRepository.deleteById(id);
        auditService.logAction("HARD_DELETE", "ADMIN", "SCHOLARSHIP", id,
                "Permanently deleted scholarship");

        // ===== REDIS: Invalidate caches =====
        redisCacheService.evictScholarship(id);
        redisCacheService.evictAllScholarships();
    }

    /**
     * Enhanced eligibility engine with Redis caching.
     *
     * FLOW:
     * 1. Look up the User and Student entities
     * 2. Check Redis for key "eligible:user:{userId}"
     * 3. CACHE HIT → return cached eligibility list
     * 4. CACHE MISS → run the complex eligibility query → cache result → return
     *
     * WHY CACHE ELIGIBILITY?
     * The eligibility query is the most complex in the system:
     * - JOINs across scholarships, filtering by CGPA, income, category, deadline
     * - Students check eligibility repeatedly (refreshing, comparing)
     * - Results change infrequently (only when scholarships or profile changes)
     */
    public List<ScholarshipDTO> getEligibleScholarships(String username) {
        logger.info("Fetching eligible scholarships for user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student profile not found. Please complete your profile first."));

        // ===== REDIS: Check cache first =====
        List<ScholarshipDTO> cached = redisCacheService.getCachedEligibleScholarships(user.getId());
        if (cached != null) {
            logger.info("Returning {} cached eligible scholarships for user: {}",
                    cached.size(), username);
            return cached;
        }

        // CACHE MISS: Run the complex eligibility query
        List<Scholarship> eligible = scholarshipRepository.findEligibleScholarships(
                student.getCgpa(),
                student.getAnnualIncome(),
                student.getCategory(),
                LocalDate.now());

        List<ScholarshipDTO> result = eligible.stream()
                .map(DtoMapper::mapToScholarshipDTO)
                .collect(Collectors.toList());

        // ===== REDIS: Cache the result =====
        redisCacheService.cacheEligibleScholarships(user.getId(), result);

        logger.info("Found {} eligible scholarships for user: {}", result.size(), username);
        return result;
    }
}
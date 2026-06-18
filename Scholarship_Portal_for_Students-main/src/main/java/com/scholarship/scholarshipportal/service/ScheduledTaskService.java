package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.entity.Application;
import com.scholarship.scholarshipportal.entity.Scholarship;
import com.scholarship.scholarshipportal.repository.ApplicationRepository;
import com.scholarship.scholarshipportal.repository.ScholarshipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled Task Service for background maintenance operations.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Production systems need automated maintenance without manual intervention:
 * 1. Expired scholarships should be deactivated automatically
 * 2. Stale applications should be archived
 * 3. Analytics cache should be periodically refreshed
 * 4. Cache statistics should be logged for monitoring
 *
 * DESIGN PATTERN: Cron-based Scheduler (Spring @Scheduled)
 *
 * SPRING BOOT CONCEPTS:
 * - @Scheduled: Marks a method for periodic execution
 * - fixedRate: Execute every N milliseconds (regardless of previous execution time)
 * - cron: Cron expression for complex scheduling (e.g., "every day at midnight")
 * - @EnableScheduling: Must be on the main application class to activate
 *
 * INTERVIEW VALUE:
 * "We use Spring's @Scheduled with cron expressions for background tasks:
 * - Scholarship expiry runs daily at midnight
 * - Analytics cache refresh runs every 5 minutes
 * - Cache metrics logging runs every 10 minutes
 * These tasks use @Transactional for consistency and are idempotent."
 *
 * INTERVIEW QUESTIONS:
 * 1. What if the server crashes during a scheduled task? → The task is idempotent.
 *    On restart, it will re-process and produce the same result.
 * 2. What about distributed environments? → In a multi-instance setup, use
 *    ShedLock or a distributed lock to ensure only one instance runs the task.
 * 3. Why not use Quartz? → Spring @Scheduled is simpler for single-instance deployments.
 *    Quartz provides persistence and clustering for enterprise requirements.
 */
@Service
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final ScholarshipRepository scholarshipRepository;
    private final ApplicationRepository applicationRepository;
    private final RedisCacheService redisCacheService;
    private final AnalyticsService analyticsService;

    public ScheduledTaskService(ScholarshipRepository scholarshipRepository,
                                 ApplicationRepository applicationRepository,
                                 RedisCacheService redisCacheService,
                                 AnalyticsService analyticsService) {
        this.scholarshipRepository = scholarshipRepository;
        this.applicationRepository = applicationRepository;
        this.redisCacheService = redisCacheService;
        this.analyticsService = analyticsService;
    }

    // ==================== SCHOLARSHIP EXPIRY ====================

    /**
     * Automatically deactivate scholarships whose deadlines have passed.
     *
     * Runs daily at midnight (00:00).
     * Cron: second minute hour day-of-month month day-of-week
     *
     * WHY: Without this, expired scholarships remain in "active" listings,
     * confusing students who try to apply and get deadline errors.
     *
     * IDEMPOTENT: Running this multiple times produces the same result.
     * Already-deactivated scholarships are skipped by the filter.
     */
    @Scheduled(cron = "0 0 0 * * *") // Every day at midnight
    @Transactional
    public void expireOldScholarships() {
        logger.info("SCHEDULER: Running scholarship expiry check...");

        LocalDate today = LocalDate.now();
        List<Scholarship> activeScholarships = scholarshipRepository.findByIsDeletedFalseAndIsActiveTrue();

        int expiredCount = 0;
        for (Scholarship scholarship : activeScholarships) {
            if (scholarship.getDeadline() != null && scholarship.getDeadline().isBefore(today)) {
                scholarship.setIsActive(false);
                scholarshipRepository.save(scholarship);
                expiredCount++;
                logger.info("SCHEDULER: Expired scholarship: ID={}, Title='{}', Deadline={}",
                        scholarship.getId(), scholarship.getTitle(), scholarship.getDeadline());
            }
        }

        if (expiredCount > 0) {
            // Invalidate caches since scholarship status changed
            redisCacheService.evictAllScholarships();
            logger.info("SCHEDULER: {} scholarships deactivated, cache invalidated", expiredCount);
        } else {
            logger.info("SCHEDULER: No scholarships to expire");
        }
    }

    // ==================== APPLICATION ARCHIVAL ====================

    /**
     * Archive old completed applications (approved/rejected older than 6 months).
     *
     * Runs weekly on Sunday at 2:00 AM.
     *
     * WHY: Old applications clutter the admin dashboard and slow down queries.
     * Archiving moves them out of the active result set.
     *
     * NOTE: This logs the count but doesn't delete — in production, you would
     * move them to an archive table or mark them as archived.
     */
    @Scheduled(cron = "0 0 2 * * SUN") // Every Sunday at 2 AM
    public void archiveCompletedApplications() {
        logger.info("SCHEDULER: Running application archival check...");

        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);

        List<Application> approvedApps = applicationRepository.findByStatus(Application.Status.APPROVED);
        List<Application> rejectedApps = applicationRepository.findByStatus(Application.Status.REJECTED);

        long archivableApproved = approvedApps.stream()
                .filter(app -> app.getAppliedDate() != null && app.getAppliedDate().isBefore(sixMonthsAgo))
                .count();

        long archivableRejected = rejectedApps.stream()
                .filter(app -> app.getAppliedDate() != null && app.getAppliedDate().isBefore(sixMonthsAgo))
                .count();

        logger.info("SCHEDULER: Archival candidates - {} approved, {} rejected (older than 6 months)",
                archivableApproved, archivableRejected);
    }

    // ==================== ANALYTICS REFRESH ====================

    /**
     * Proactively refresh the analytics cache to prevent cache stampedes.
     *
     * Runs every 5 minutes.
     *
     * WHY: If the analytics cache expires and multiple admins hit the dashboard
     * simultaneously, all requests would hit the database (cache stampede).
     * Proactive refresh ensures the cache is always warm.
     *
     * INTERVIEW VALUE:
     * "We use proactive cache refresh to prevent cache stampedes. A scheduled task
     * recomputes analytics every 5 minutes, keeping the cache warm. This is the
     * same pattern Netflix uses for their catalog cache."
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes (300,000 ms)
    public void refreshAnalyticsCache() {
        logger.debug("SCHEDULER: Refreshing analytics cache...");
        try {
            // Evict and recompute
            redisCacheService.evictAnalytics();
            analyticsService.getAnalytics(); // This will recompute and cache
            logger.debug("SCHEDULER: Analytics cache refreshed successfully");
        } catch (Exception e) {
            logger.error("SCHEDULER: Failed to refresh analytics cache: {}", e.getMessage());
        }
    }

    // ==================== CACHE METRICS LOGGING ====================

    /**
     * Log cache statistics for operational monitoring.
     *
     * Runs every 10 minutes.
     *
     * WHY: Without cache metrics, you can't tell if the cache is effective.
     * A cache with 0% hit ratio is wasting Redis memory.
     * Logging metrics enables alerting on cache degradation.
     */
    @Scheduled(fixedRate = 600000) // Every 10 minutes (600,000 ms)
    public void logCacheMetrics() {
        logger.info("SCHEDULER: Cache metrics - {}", redisCacheService.getCacheMetrics());
    }
}

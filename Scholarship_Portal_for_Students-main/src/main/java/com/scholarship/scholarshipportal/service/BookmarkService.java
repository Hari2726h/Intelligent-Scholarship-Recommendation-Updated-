package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.entity.Scholarship;
import com.scholarship.scholarshipportal.entity.ScholarshipBookmark;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.exception.DuplicateResourceException;
import com.scholarship.scholarshipportal.exception.ResourceNotFoundException;
import com.scholarship.scholarshipportal.repository.ScholarshipBookmarkRepository;
import com.scholarship.scholarshipportal.repository.ScholarshipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing scholarship bookmarks (saved scholarships)
 */
@Service
public class BookmarkService {

    private static final Logger logger = LoggerFactory.getLogger(BookmarkService.class);

    private final ScholarshipBookmarkRepository bookmarkRepository;
    private final ScholarshipRepository scholarshipRepository;

    public BookmarkService(ScholarshipBookmarkRepository bookmarkRepository,
                          ScholarshipRepository scholarshipRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.scholarshipRepository = scholarshipRepository;
    }

    /**
     * Bookmark a scholarship
     */
    @Transactional
    public ScholarshipBookmark bookmarkScholarship(Student student, Long scholarshipId) {
        // Check if scholarship exists
        Scholarship scholarship = scholarshipRepository.findById(scholarshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Scholarship not found"));

        // Check if already bookmarked
        if (bookmarkRepository.existsByStudentIdAndScholarshipId(student.getId(), scholarshipId)) {
            throw new DuplicateResourceException("Scholarship already bookmarked");
        }

        ScholarshipBookmark bookmark = new ScholarshipBookmark(student, scholarship);
        ScholarshipBookmark saved = bookmarkRepository.save(bookmark);

        logger.info("Student {} bookmarked scholarship {}", student.getId(), scholarshipId);
        return saved;
    }

    /**
     * Remove bookmark
     */
    @Transactional
    public void removeBookmark(Student student, Long scholarshipId) {
        if (!bookmarkRepository.existsByStudentIdAndScholarshipId(student.getId(), scholarshipId)) {
            throw new ResourceNotFoundException("Bookmark not found");
        }

        bookmarkRepository.deleteByStudentIdAndScholarshipId(student.getId(), scholarshipId);
        logger.info("Student {} removed bookmark for scholarship {}", student.getId(), scholarshipId);
    }

    /**
     * Get all bookmarked scholarships for a student
     */
    public List<Scholarship> getBookmarkedScholarships(Student student) {
        List<ScholarshipBookmark> bookmarks = bookmarkRepository.findByStudentId(student.getId());
        return bookmarks.stream()
                .map(ScholarshipBookmark::getScholarship)
                .collect(Collectors.toList());
    }

    /**
     * Check if scholarship is bookmarked by student
     */
    public boolean isBookmarked(Student student, Long scholarshipId) {
        return bookmarkRepository.existsByStudentIdAndScholarshipId(student.getId(), scholarshipId);
    }

    /**
     * Get bookmark count for a scholarship
     */
    public long getBookmarkCount(Long scholarshipId) {
        return bookmarkRepository.countByScholarshipId(scholarshipId);
    }
}

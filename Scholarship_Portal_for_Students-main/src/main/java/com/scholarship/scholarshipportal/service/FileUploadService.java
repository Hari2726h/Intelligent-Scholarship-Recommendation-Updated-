package com.scholarship.scholarshipportal.service;

import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.StudentDocument;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.exception.InvalidFileException;
import com.scholarship.scholarshipportal.exception.ResourceNotFoundException;
import com.scholarship.scholarshipportal.repository.StudentDocumentRepository;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling file uploads and document management
 */
@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "jpg", "jpeg", "png", "doc", "docx");

    @Value("${file.upload.dir:uploads/documents}")
    private String uploadDir;

    private final StudentDocumentRepository documentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public FileUploadService(StudentDocumentRepository documentRepository, StudentRepository studentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Upload student document
     */
    @Transactional
    public StudentDocument uploadDocument(MultipartFile file, String username, String documentType) {
        // Validate file
        validateFile(file);

        // Get user first, then student
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        // Create upload directory if not exists
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String newFilename = UUID.randomUUID().toString() + "_" + student.getId() + "." + extension;
            Path filePath = uploadPath.resolve(newFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save document record
            StudentDocument document = new StudentDocument(
                    student,
                    documentType,
                    originalFilename,
                    filePath.toString(),
                    file.getSize(),
                    file.getContentType()
            );

            StudentDocument saved = documentRepository.save(document);
            logger.info("Document uploaded successfully: {} for student: {}", documentType, username);
            return saved;

        } catch (IOException e) {
            logger.error("Failed to upload file: {}", e.getMessage());
            throw new InvalidFileException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Get student documents
     */
    public List<StudentDocument> getStudentDocuments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        
        return documentRepository.findByStudentIdOrderByUploadedAtDesc(student.getId());
    }

    /**
     * Delete document
     */
    @Transactional
    public void deleteDocument(Long documentId, String username) {
        StudentDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (!document.getStudent().getUser().getUsername().equals(username)) {
            throw new InvalidFileException("Unauthorized to delete this document");
        }

        try {
            // Delete physical file
            Files.deleteIfExists(Paths.get(document.getFilePath()));
            // Delete database record
            documentRepository.delete(document);
            logger.info("Document deleted successfully: ID {}", documentId);
        } catch (IOException e) {
            logger.error("Failed to delete file: {}", e.getMessage());
        }
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File size exceeds maximum limit of 5MB");
        }

        String filename = file.getOriginalFilename();
        String extension = getFileExtension(filename);

        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new InvalidFileException("File type not allowed. Allowed types: " + ALLOWED_EXTENSIONS);
        }
    }

    /**
     * Extract file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new InvalidFileException("Invalid filename");
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}

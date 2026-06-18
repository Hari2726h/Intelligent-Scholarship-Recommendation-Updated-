package com.scholarship.scholarshipportal.controller;

import com.scholarship.scholarshipportal.dto.ApiResponse;
import com.scholarship.scholarshipportal.dto.FileUploadDTO;
import com.scholarship.scholarshipportal.entity.StudentDocument;
import com.scholarship.scholarshipportal.service.FileUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Controller for handling student document uploads
 */
@Tag(name = "Documents", description = "Student document upload and management APIs")
@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final FileUploadService fileUploadService;

    public DocumentController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @Operation(summary = "Upload a student document",
            description = "Uploads a document (PDF, JPG, PNG) for the authenticated student. "
                    + "Max file size: 5MB. Publishes a DocumentUploadedEvent to Kafka.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Document uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file type or size exceeded")
    })
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileUploadDTO>> uploadDocument(
            @Parameter(description = "Document file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Document type (e.g., MARKSHEET, INCOME_CERTIFICATE)") @RequestParam("documentType") String documentType,
            Authentication authentication) {

        String username = authentication.getName();
        StudentDocument document = fileUploadService.uploadDocument(file, username, documentType);

        FileUploadDTO response = new FileUploadDTO(
                document.getId(),
                document.getFileName(),
                document.getDocumentType(),
                document.getFileSize(),
                "File uploaded successfully"
        );

        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", response));
    }

    @Operation(summary = "Get my documents",
            description = "Returns all documents uploaded by the authenticated student.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Documents retrieved successfully")
    })
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<StudentDocument>>> getMyDocuments(Authentication authentication) {
        String username = authentication.getName();
        List<StudentDocument> documents = fileUploadService.getStudentDocuments(username);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    @Operation(summary = "Delete a document",
            description = "Permanently deletes a document. Only the document owner can delete it.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Document deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Document not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not authorized to delete this document")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @Parameter(description = "Document ID") @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        fileUploadService.deleteDocument(id, username);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}

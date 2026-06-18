package com.scholarship.scholarshipportal.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.scholarship.scholarshipportal.dto.CollegeDashboardDTO;
import com.scholarship.scholarshipportal.dto.CollegeEligibilityResultDTO;
import com.scholarship.scholarshipportal.dto.CollegeStudentInsightDTO;
import com.scholarship.scholarshipportal.dto.CollegeStudentNotificationGroupDTO;
import com.scholarship.scholarshipportal.dto.CollegeUploadResultDTO;
import com.scholarship.scholarshipportal.dto.ProfileStrengthDTO;
import com.scholarship.scholarshipportal.dto.ScholarshipRecommendationDTO;
import com.scholarship.scholarshipportal.dto.StudentDTO;
import com.scholarship.scholarshipportal.entity.Notification.NotificationType;
import com.scholarship.scholarshipportal.entity.Scholarship;
import com.scholarship.scholarshipportal.entity.Student;
import com.scholarship.scholarshipportal.entity.StudentDocument;
import com.scholarship.scholarshipportal.entity.User;
import com.scholarship.scholarshipportal.repository.ScholarshipRepository;
import com.scholarship.scholarshipportal.repository.StudentDocumentRepository;
import com.scholarship.scholarshipportal.repository.StudentRepository;
import com.scholarship.scholarshipportal.repository.UserRepository;
import com.scholarship.scholarshipportal.util.DtoMapper;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final RecommendationService recommendationService;
    private final ProfileStrengthService profileStrengthService;
    private final StudentDocumentRepository studentDocumentRepository;

    public StudentService(StudentRepository studentRepository,
            UserRepository userRepository,
            ScholarshipRepository scholarshipRepository,
            NotificationService notificationService,
            EmailService emailService,
            RecommendationService recommendationService,
            ProfileStrengthService profileStrengthService,
            StudentDocumentRepository studentDocumentRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.recommendationService = recommendationService;
        this.profileStrengthService = profileStrengthService;
        this.studentDocumentRepository = studentDocumentRepository;
    }

    public StudentDTO createOrUpdateProfile(StudentDTO studentDTO, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Student student = studentRepository.findByUser(user).orElse(new Student());
        student.setUser(user);
        student.setName(studentDTO.getName());
        student.setTenthMarks(studentDTO.getTenthMarks());
        student.setTwelfthMarks(studentDTO.getTwelfthMarks());
        student.setCgpa(studentDTO.getCgpa());
        student.setAnnualIncome(studentDTO.getAnnualIncome());
        student.setCategory(studentDTO.getCategory());
        student.setContactEmail(user.getEmail());
        student.setCollegeName(studentDTO.getCollegeName());
        student.setPhoneNumber(studentDTO.getPhoneNumber());
        student.setDateOfBirth(studentDTO.getDateOfBirth());
        student.setGender(studentDTO.getGender());
        student.setAddress(studentDTO.getAddress());
        student.setState(studentDTO.getState());
        student.setDistrict(studentDTO.getDistrict());
        student.setPincode(studentDTO.getPincode());
        student.setInstitutionName(studentDTO.getInstitutionName());
        student.setDepartment(studentDTO.getDepartment());
        student.setCourse(studentDTO.getCourse());
        student.setYearOfStudy(studentDTO.getYearOfStudy());
        student.setDisability(studentDTO.getDisability() != null ? studentDTO.getDisability() : false);
        student.setSports(studentDTO.getSports() != null ? studentDTO.getSports() : false);
        student.setExService(studentDTO.getExService() != null ? studentDTO.getExService() : false);

        Student saved = studentRepository.save(student);
        return DtoMapper.mapToStudentDTO(saved);
    }

    public StudentDTO getProfile(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Student student = studentRepository.findByUser(user).orElse(null);
        if (student == null) {
            return null;
        }

        return DtoMapper.mapToStudentDTO(student);
    }

    public StudentDTO createOrUpdateManagedStudent(StudentDTO studentDTO, String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new RuntimeException("College manager not found"));

        Student student = null;
        if (studentDTO.getId() != null) {
            student = studentRepository.findByCollegeManagerAndId(manager, studentDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Managed student not found"));
        }

        if (student == null) {
            student = new Student();
        }

        student.setCollegeManager(manager);
        student.setName(studentDTO.getName());
        student.setTenthMarks(studentDTO.getTenthMarks());
        student.setTwelfthMarks(studentDTO.getTwelfthMarks());
        student.setCgpa(studentDTO.getCgpa());
        student.setAnnualIncome(studentDTO.getAnnualIncome());
        student.setCategory(studentDTO.getCategory());
        student.setContactEmail(studentDTO.getContactEmail());
        student.setCollegeName(studentDTO.getCollegeName());
        student.setPhoneNumber(studentDTO.getPhoneNumber());
        student.setDateOfBirth(studentDTO.getDateOfBirth());
        student.setGender(studentDTO.getGender());
        student.setAddress(studentDTO.getAddress());
        student.setState(studentDTO.getState());
        student.setDistrict(studentDTO.getDistrict());
        student.setPincode(studentDTO.getPincode());
        student.setInstitutionName(studentDTO.getInstitutionName());
        student.setDepartment(studentDTO.getDepartment());
        student.setCourse(studentDTO.getCourse());
        student.setYearOfStudy(studentDTO.getYearOfStudy());
        student.setDisability(studentDTO.getDisability() != null ? studentDTO.getDisability() : false);
        student.setSports(studentDTO.getSports() != null ? studentDTO.getSports() : false);
        student.setExService(studentDTO.getExService() != null ? studentDTO.getExService() : false);

        Student saved = studentRepository.save(student);
        return DtoMapper.mapToStudentDTO(saved);
    }

    public List<StudentDTO> getManagedStudents(String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new RuntimeException("College manager not found"));

        return studentRepository.findByCollegeManagerOrderByIdDesc(manager)
                .stream()
                .map(DtoMapper::mapToStudentDTO)
                .toList();
    }

    public CollegeEligibilityResultDTO notifyEligibleScholarshipsForManagedStudent(Long studentId, String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new RuntimeException("College manager not found"));

        Student student = studentRepository.findByCollegeManagerAndId(manager, studentId)
                .orElseThrow(() -> new RuntimeException("Managed student not found"));

        List<Scholarship> eligibleScholarships = scholarshipRepository.findEligibleScholarships(
                student.getCgpa(),
                student.getAnnualIncome(),
                student.getCategory(),
                LocalDate.now());

        CollegeEligibilityResultDTO result = new CollegeEligibilityResultDTO();
        result.setStudentId(student.getId());
        result.setStudentName(student.getName());
        String recipientEmail = resolveStudentEmail(student);
        result.setStudentEmail(recipientEmail);
        result.setEligibleScholarshipCount(eligibleScholarships.size());

        List<String> scholarshipTitles = new ArrayList<>();
        int sentCount = 0;

        for (Scholarship scholarship : eligibleScholarships) {
            scholarshipTitles.add(scholarship.getTitle());

            String managerMessage = String.format(
                    "%s is eligible for %s",
                    student.getName(),
                    scholarship.getTitle());

            notificationService.createNotificationForUser(
                    manager,
                    managerMessage,
                    NotificationType.ELIGIBILITY_ALERT,
                    scholarship.getId(),
                    scholarship.getApplicationLink(),
                    student.getId(),
                    student.getName(),
                    recipientEmail);

                if (recipientEmail != null && !recipientEmail.isBlank()) {
                emailService.sendEligibilityAlertEmail(
                    recipientEmail,
                        student.getName(),
                        scholarship.getTitle(),
                        scholarship.getDeadline() != null ? scholarship.getDeadline().toString() : "N/A",
                        scholarship.getApplicationLink());
                sentCount++;
            }
        }

        result.setScholarshipTitles(scholarshipTitles);
        result.setEmailNotificationsSent(sentCount);
        return result;
    }

    public List<CollegeEligibilityResultDTO> notifyEligibleScholarshipsForAllManagedStudents(String managerUsername) {
        List<StudentDTO> managedStudents = getManagedStudents(managerUsername);
        List<CollegeEligibilityResultDTO> results = new ArrayList<>();

        for (StudentDTO student : managedStudents) {
            results.add(notifyEligibleScholarshipsForManagedStudent(student.getId(), managerUsername));
        }

        return results;
    }

    public CollegeDashboardDTO getCollegeDashboardStats(String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new RuntimeException("College manager not found"));

        List<Student> managedStudents = studentRepository.findByCollegeManagerOrderByIdDesc(manager);
        long withEmail = managedStudents.stream()
                .filter(s -> s.getContactEmail() != null && !s.getContactEmail().isBlank())
                .count();
        long withDocuments = managedStudents.stream()
            .filter(s -> studentDocumentRepository.countByStudentId(s.getId()) > 0)
            .count();
        long readyForApplications = managedStudents.stream()
            .filter(this::isReadyForApplications)
            .count();
        long totalEligibleScholarships = managedStudents.stream()
            .mapToLong(s -> findEligibleScholarshipsForStudent(s).size())
            .sum();

        CollegeDashboardDTO dto = new CollegeDashboardDTO();
        dto.setTotalManagedStudents((long) managedStudents.size());
        dto.setStudentsWithEmail(withEmail);
        dto.setStudentsWithDocuments(withDocuments);
        dto.setStudentsReadyForApplications(readyForApplications);
        dto.setTotalEligibleScholarships(totalEligibleScholarships);
        dto.setNotificationsSentToday(0L);
        return dto;
    }

        public CollegeStudentInsightDTO getManagedStudentInsights(Long studentId, String managerUsername) {
        User manager = userRepository.findByUsername(managerUsername)
            .orElseThrow(() -> new RuntimeException("College manager not found"));

        Student student = studentRepository.findByCollegeManagerAndId(manager, studentId)
            .orElseThrow(() -> new RuntimeException("Managed student not found"));

        return buildManagedStudentInsights(student);
    }

    public List<CollegeStudentNotificationGroupDTO> getCollegeNotificationsGroupedByStudent(String managerUsername) {
        return notificationService.getCollegeNotificationsGroupedByStudent(managerUsername);
    }

    public CollegeUploadResultDTO uploadManagedStudentsFromCsv(MultipartFile file, String managerUsername) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please upload a non-empty CSV file");
        }

        String originalFilename = file.getOriginalFilename();
        String originalName = originalFilename == null ? "" : originalFilename.toLowerCase();
        if (!originalName.endsWith(".csv")) {
            throw new IllegalArgumentException("Only CSV file upload is supported");
        }

        CollegeUploadResultDTO result = new CollegeUploadResultDTO();
        List<String> errors = new ArrayList<>();
        int success = 0;
        int failed = 0;
        int total = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.isBlank()) {
                throw new IllegalArgumentException("CSV header is missing");
            }

            String[] headers = headerLine.split(",");
            Map<String, Integer> headerIndex = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                headerIndex.put(headers[i].trim().toLowerCase(), i);
            }

            if (!headerIndex.containsKey("name") || !headerIndex.containsKey("contactemail")
                    || !headerIndex.containsKey("annualincome")) {
                throw new IllegalArgumentException("CSV must contain: name, contactEmail, annualIncome columns");
            }

            String line;
            int lineNo = 1;
            while ((line = reader.readLine()) != null) {
                lineNo++;
                if (line.isBlank()) {
                    continue;
                }

                total++;
                try {
                    String[] values = line.split(",", -1);
                    StudentDTO dto = buildStudentFromCsv(values, headerIndex);
                    createOrUpdateManagedStudent(dto, managerUsername);
                    success++;
                } catch (Exception ex) {
                    failed++;
                    errors.add("Row " + lineNo + ": " + ex.getMessage());
                }
            }
        } catch (Exception ex) {
            throw new IllegalArgumentException("Failed to process CSV: " + ex.getMessage());
        }

        result.setTotalRows(total);
        result.setSuccessCount(success);
        result.setFailedCount(failed);
        result.setErrors(errors);
        return result;
    }

    private StudentDTO buildStudentFromCsv(String[] values, Map<String, Integer> headerIndex) {
        StudentDTO dto = new StudentDTO();
        dto.setName(getCsv(values, headerIndex, "name"));
        dto.setContactEmail(getCsv(values, headerIndex, "contactemail"));
        dto.setCollegeName(getCsv(values, headerIndex, "collegename"));
        dto.setCategory(defaultIfBlank(getCsv(values, headerIndex, "category"), "GENERAL"));
        dto.setPhoneNumber(getCsv(values, headerIndex, "phonenumber"));
        dto.setGender(getCsv(values, headerIndex, "gender"));
        dto.setAddress(getCsv(values, headerIndex, "address"));
        dto.setState(getCsv(values, headerIndex, "state"));
        dto.setDistrict(getCsv(values, headerIndex, "district"));
        dto.setPincode(getCsv(values, headerIndex, "pincode"));
        dto.setInstitutionName(getCsv(values, headerIndex, "institutionname"));
        dto.setDepartment(getCsv(values, headerIndex, "department"));
        dto.setCourse(getCsv(values, headerIndex, "course"));
        dto.setYearOfStudy(parseIntegerOrNull(getCsv(values, headerIndex, "yearofstudy")));

        dto.setAnnualIncome(new BigDecimal(defaultIfBlank(getCsv(values, headerIndex, "annualincome"), "0")));
        dto.setCgpa(parseDoubleOrNull(getCsv(values, headerIndex, "cgpa")));
        dto.setTenthMarks(parseDoubleOrDefault(getCsv(values, headerIndex, "tenthmarks"), 0));
        dto.setTwelfthMarks(parseDoubleOrDefault(getCsv(values, headerIndex, "twelfthmarks"), 0));
        dto.setDisability(parseBooleanOrDefault(getCsv(values, headerIndex, "disability"), false));
        dto.setSports(parseBooleanOrDefault(getCsv(values, headerIndex, "sports"), false));
        dto.setExService(parseBooleanOrDefault(getCsv(values, headerIndex, "exservice"), false));

        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (dto.getContactEmail() == null || dto.getContactEmail().isBlank()) {
            throw new IllegalArgumentException("contactEmail is required");
        }

        return dto;
    }

    private String getCsv(String[] values, Map<String, Integer> headerIndex, String key) {
        Integer idx = headerIndex.get(key);
        if (idx == null || idx < 0 || idx >= values.length) {
            return null;
        }
        return values[idx].trim();
    }

    private String defaultIfBlank(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private Double parseDoubleOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Double.parseDouble(value);
    }

    private double parseDoubleOrDefault(String value, double fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return Double.parseDouble(value);
    }

    private boolean parseBooleanOrDefault(String value, boolean fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String v = value.trim().toLowerCase();
        return "true".equals(v) || "1".equals(v) || "yes".equals(v) || "y".equals(v);
    }

    private Integer parseIntegerOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Integer.parseInt(value);
    }

    private CollegeStudentInsightDTO buildManagedStudentInsights(Student student) {
        ProfileStrengthDTO profileStrength = profileStrengthService.calculateProfileStrength(student);
        List<StudentDocument> documents = studentDocumentRepository.findByStudentIdOrderByUploadedAtDesc(student.getId());
        List<ScholarshipRecommendationDTO> recommendations = recommendationService.getTopRecommendations(student, 5);
        List<Scholarship> eligibleScholarships = findEligibleScholarshipsForStudent(student);

        CollegeStudentInsightDTO dto = new CollegeStudentInsightDTO();
        dto.setStudentId(student.getId());
        dto.setStudentName(student.getName());
        dto.setContactEmail(student.getContactEmail());
        dto.setProfileStrength(profileStrength);
        dto.setDocumentCount(documents.size());
        dto.setDocumentTypes(documents.stream()
                .map(StudentDocument::getDocumentType)
                .distinct()
                .toList());
        dto.setEligibleScholarshipCount(eligibleScholarships.size());
        dto.setHighMatchScholarshipCount((int) recommendations.stream()
                .filter(recommendation -> recommendation.getMatchScore() != null && recommendation.getMatchScore() >= 80)
                .count());
        dto.setReadyForApplications(isReadyForApplications(student));
        dto.setTopRecommendations(recommendations);
        return dto;
    }

    private boolean isReadyForApplications(Student student) {
        ProfileStrengthDTO profileStrength = profileStrengthService.calculateProfileStrength(student);
        return profileStrength.getOverallScore() >= 70 && studentDocumentRepository.countByStudentId(student.getId()) > 0;
    }

    private List<Scholarship> findEligibleScholarshipsForStudent(Student student) {
        return scholarshipRepository.findEligibleScholarships(
                student.getCgpa(),
                student.getAnnualIncome(),
                student.getCategory(),
                LocalDate.now());
    }

    private String resolveStudentEmail(Student student) {
        if (student.getUser() != null && student.getUser().getEmail() != null && !student.getUser().getEmail().isBlank()) {
            return student.getUser().getEmail();
        }
        if (student.getContactEmail() != null && !student.getContactEmail().isBlank()) {
            return student.getContactEmail();
        }
        return null;
    }
}
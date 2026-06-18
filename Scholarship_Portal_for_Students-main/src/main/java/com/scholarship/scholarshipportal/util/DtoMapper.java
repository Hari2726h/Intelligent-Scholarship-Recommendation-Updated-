package com.scholarship.scholarshipportal.util;

import com.scholarship.scholarshipportal.dto.*;
import com.scholarship.scholarshipportal.entity.*;

public class DtoMapper {
    public static StudentDTO mapToStudentDTO(Student student) {
        if (student == null) return null;
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setTenthMarks(student.getTenthMarks());
        dto.setTwelfthMarks(student.getTwelfthMarks());
        dto.setCgpa(student.getCgpa());
        dto.setAnnualIncome(student.getAnnualIncome());
        dto.setCategory(student.getCategory());
        dto.setPhoneNumber(student.getPhoneNumber());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setGender(student.getGender());
        dto.setAddress(student.getAddress());
        dto.setState(student.getState());
        dto.setDistrict(student.getDistrict());
        dto.setPincode(student.getPincode());
        dto.setInstitutionName(student.getInstitutionName());
        dto.setDepartment(student.getDepartment());
        dto.setCourse(student.getCourse());
        dto.setYearOfStudy(student.getYearOfStudy());
        dto.setContactEmail(student.getContactEmail());
        dto.setCollegeName(student.getCollegeName());
        dto.setManagedByCollege(student.getCollegeManager() != null);
        if (student.getCollegeManager() != null) {
            dto.setCollegeManagerUsername(student.getCollegeManager().getUsername());
        }
        dto.setDisability(student.getDisability());
        dto.setSports(student.getSports());
        dto.setExService(student.getExService());
        return dto;
    }

    public static ScholarshipDTO mapToScholarshipDTO(Scholarship s) {
        if (s == null) return null;
        ScholarshipDTO dto = new ScholarshipDTO();
        dto.setId(s.getId());
        dto.setTitle(s.getTitle());
        dto.setDescription(s.getDescription());
        dto.setMinCgpa(s.getMinCgpa());
        dto.setMaxIncome(s.getMaxIncome());
        dto.setCategory(s.getCategory());
        dto.setAmount(s.getAmount());
        dto.setDeadline(s.getDeadline());
        dto.setApplicationLink(s.getApplicationLink());
        dto.setProvider(s.getProvider());
        dto.setAwardCount(s.getAwardCount());
        dto.setIsActive(s.getIsActive());
        dto.setApplicationDeadline(s.getApplicationDeadline());
        dto.setApplicationStartDate(s.getApplicationStartDate());
        dto.setCreatedAt(s.getCreatedAt());
        if(s.getCreatedBy() != null) dto.setCreatedBy(s.getCreatedBy().getUsername());
        return dto;
    }

    public static ApplicationDTO mapToApplicationDTO(Application a) {
        if (a == null) return null;
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(a.getId());
        dto.setStudent(mapToStudentDTO(a.getStudent()));
        dto.setScholarship(mapToScholarshipDTO(a.getScholarship()));
        dto.setStatus(a.getStatus());
        dto.setAppliedDate(a.getAppliedDate());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }
    
    public static NotificationDTO mapToNotificationDTO(Notification n) {
        if(n == null) return null;
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setMessage(n.getMessage());
        dto.setNotificationType(n.getNotificationType() != null ? n.getNotificationType().name() : null);
        dto.setScholarshipId(n.getScholarshipId());
        dto.setStudentId(n.getStudentId());
        dto.setStudentName(n.getStudentName());
        dto.setStudentEmail(n.getStudentEmail());
        dto.setActionLink(n.getActionLink());
        dto.setIsRead(n.getIsRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}

package com.scholarship.scholarshipportal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.*;

/**
 * DTO for student profile data.
 */
public class StudentDTO {
    private Long id;

    @NotBlank(message = "Student name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Min(value = 0, message = "10th marks must be at least 0")
    @Max(value = 100, message = "10th marks must not exceed 100")
    private double tenthMarks;

    @Min(value = 0, message = "12th marks must be at least 0")
    @Max(value = 100, message = "12th marks must not exceed 100")
    private double twelfthMarks;

    @DecimalMin(value = "0.0", message = "CGPA must be at least 0.0")
    @DecimalMax(value = "10.0", message = "CGPA must not exceed 10.0")
    private Double cgpa;

    @NotNull(message = "Annual income is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Annual income must be non-negative")
    private BigDecimal annualIncome;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "^(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 120, message = "State must not exceed 120 characters")
    private String state;

    @Size(max = 120, message = "District must not exceed 120 characters")
    private String district;

    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    @Size(max = 255, message = "Institution name must not exceed 255 characters")
    private String institutionName;

    @Size(max = 255, message = "Department must not exceed 255 characters")
    private String department;

    @Size(max = 255, message = "Course must not exceed 255 characters")
    private String course;

    @Min(value = 1, message = "Year of study must be at least 1")
    @Max(value = 8, message = "Year of study must not exceed 8")
    private Integer yearOfStudy;

    @Email(message = "Contact email must be a valid email address")
    private String contactEmail;

    @Size(max = 255, message = "College name must not exceed 255 characters")
    private String collegeName;

    private String collegeManagerUsername;
    private Boolean managedByCollege;
    private Boolean disability;
    private Boolean sports;
    private Boolean exService;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getTenthMarks() {
        return tenthMarks;
    }

    public void setTenthMarks(double tenthMarks) {
        this.tenthMarks = tenthMarks;
    }

    public double getTwelfthMarks() {
        return twelfthMarks;
    }

    public void setTwelfthMarks(double twelfthMarks) {
        this.twelfthMarks = twelfthMarks;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public BigDecimal getAnnualIncome() {
        return annualIncome;
    }

    public void setAnnualIncome(BigDecimal annualIncome) {
        this.annualIncome = annualIncome;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getCollegeName() {
        return collegeName;
    }

    public void setCollegeName(String collegeName) {
        this.collegeName = collegeName;
    }

    public String getCollegeManagerUsername() {
        return collegeManagerUsername;
    }

    public void setCollegeManagerUsername(String collegeManagerUsername) {
        this.collegeManagerUsername = collegeManagerUsername;
    }

    public Boolean getManagedByCollege() {
        return managedByCollege;
    }

    public void setManagedByCollege(Boolean managedByCollege) {
        this.managedByCollege = managedByCollege;
    }

    public Boolean getDisability() {
        return disability;
    }

    public void setDisability(Boolean disability) {
        this.disability = disability;
    }

    public Boolean getSports() {
        return sports;
    }

    public void setSports(Boolean sports) {
        this.sports = sports;
    }

    public Boolean getExService() {
        return exService;
    }

    public void setExService(Boolean exService) {
        this.exService = exService;
    }
}

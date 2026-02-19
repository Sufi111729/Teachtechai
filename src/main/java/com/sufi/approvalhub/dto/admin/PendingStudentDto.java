package com.sufi.approvalhub.dto.admin;

import com.sufi.approvalhub.domain.enums.Status;

import java.time.LocalDateTime;

public class PendingStudentDto {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Status status;
    private String rollNo;
    private String className;
    private String section;
    private String assignedTeacherCode;
    private LocalDateTime createdAt;

    public PendingStudentDto() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getAssignedTeacherCode() {
        return assignedTeacherCode;
    }

    public void setAssignedTeacherCode(String assignedTeacherCode) {
        this.assignedTeacherCode = assignedTeacherCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

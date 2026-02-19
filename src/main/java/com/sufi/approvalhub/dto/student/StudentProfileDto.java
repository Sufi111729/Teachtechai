package com.sufi.approvalhub.dto.student;

import com.sufi.approvalhub.domain.enums.Role;
import com.sufi.approvalhub.domain.enums.Status;

public class StudentProfileDto {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Status status;
    private String rollNo;
    private String className;
    private String section;
    private String assignedTeacherCode;
    private String assignedTeacherName;

    public StudentProfileDto() {
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

    public String getAssignedTeacherName() {
        return assignedTeacherName;
    }

    public void setAssignedTeacherName(String assignedTeacherName) {
        this.assignedTeacherName = assignedTeacherName;
    }
}

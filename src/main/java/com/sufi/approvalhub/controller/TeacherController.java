package com.sufi.approvalhub.controller;

import com.sufi.approvalhub.dto.teacher.TeacherPendingStudentDto;
import com.sufi.approvalhub.dto.teacher.TeacherProfileDto;
import com.sufi.approvalhub.dto.teacher.TeacherProfileUpdateRequest;
import com.sufi.approvalhub.service.TeacherApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private final TeacherApprovalService teacherApprovalService;

    public TeacherController(TeacherApprovalService teacherApprovalService) {
        this.teacherApprovalService = teacherApprovalService;
    }

    @GetMapping("/pending-students")
    public ResponseEntity<List<TeacherPendingStudentDto>> pendingStudents() {
        return ResponseEntity.ok(teacherApprovalService.getPendingStudentsForTeacher());
    }

    @GetMapping("/profile")
    public ResponseEntity<TeacherProfileDto> profile() {
        return ResponseEntity.ok(teacherApprovalService.getCurrentTeacherProfileDto());
    }

    @PutMapping("/profile")
    public ResponseEntity<TeacherProfileDto> updateProfile(@RequestBody TeacherProfileUpdateRequest request) {
        return ResponseEntity.ok(teacherApprovalService.updateCurrentTeacherProfile(request));
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<TeacherProfileDto> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                teacherApprovalService.updateAvatar(getBytes(file), file.getContentType())
        );
    }

    private byte[] getBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (Exception ex) {
            throw new com.sufi.approvalhub.exception.BadRequestException("Unable to read file");
        }
    }

    @PutMapping("/students/{userId}/approve")
    public ResponseEntity<Void> approveStudent(@PathVariable Long userId) {
        teacherApprovalService.approveStudent(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/students/{userId}/reject")
    public ResponseEntity<Void> rejectStudent(@PathVariable Long userId) {
        teacherApprovalService.rejectStudent(userId);
        return ResponseEntity.noContent().build();
    }
}

package com.sufi.approvalhub.controller;

import com.sufi.approvalhub.dto.admin.PendingStudentDto;
import com.sufi.approvalhub.dto.admin.PendingTeacherDto;
import com.sufi.approvalhub.dto.admin.analytics.ActivityLogDto;
import com.sufi.approvalhub.dto.admin.analytics.AdminStatsDto;
import com.sufi.approvalhub.dto.admin.analytics.AiAnalyticsDto;
import com.sufi.approvalhub.service.AdminApprovalService;
import com.sufi.approvalhub.service.admin.AdminAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminApprovalService adminApprovalService;
    private final AdminAnalyticsService adminAnalyticsService;

    public AdminController(AdminApprovalService adminApprovalService,
                           AdminAnalyticsService adminAnalyticsService) {
        this.adminApprovalService = adminApprovalService;
        this.adminAnalyticsService = adminAnalyticsService;
    }

    @GetMapping("/pending/teachers")
    public ResponseEntity<List<PendingTeacherDto>> pendingTeachers() {
        return ResponseEntity.ok(adminApprovalService.getPendingTeachers());
    }

    @PutMapping("/teachers/{userId}/approve")
    public ResponseEntity<Void> approveTeacher(@PathVariable Long userId) {
        adminApprovalService.approveTeacher(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/teachers/{userId}/reject")
    public ResponseEntity<Void> rejectTeacher(@PathVariable Long userId) {
        adminApprovalService.rejectTeacher(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pending/students")
    public ResponseEntity<List<PendingStudentDto>> pendingStudents() {
        return ResponseEntity.ok(adminApprovalService.getPendingStudents());
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> stats() {
        return ResponseEntity.ok(adminAnalyticsService.getStats());
    }

    @GetMapping("/ai-analytics")
    public ResponseEntity<AiAnalyticsDto> aiAnalytics() {
        return ResponseEntity.ok(adminAnalyticsService.getAiAnalytics());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLogDto>> activity() {
        return ResponseEntity.ok(adminAnalyticsService.getActivityLogs());
    }

    @PutMapping("/students/{userId}/approve")
    public ResponseEntity<Void> approveStudent(@PathVariable Long userId) {
        adminApprovalService.approveStudent(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/students/{userId}/reject")
    public ResponseEntity<Void> rejectStudent(@PathVariable Long userId) {
        adminApprovalService.rejectStudent(userId);
        return ResponseEntity.noContent().build();
    }
}

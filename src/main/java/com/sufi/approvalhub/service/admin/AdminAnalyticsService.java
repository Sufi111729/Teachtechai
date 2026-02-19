package com.sufi.approvalhub.service.admin;

import com.sufi.approvalhub.domain.enums.Role;
import com.sufi.approvalhub.domain.enums.Status;
import com.sufi.approvalhub.dto.admin.analytics.*;
import com.sufi.approvalhub.repository.UserRepository;
import com.sufi.approvalhub.repository.document.TeacherDocumentRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AdminAnalyticsService {
    private final UserRepository userRepository;
    private final TeacherDocumentRepository documentRepository;

    public AdminAnalyticsService(UserRepository userRepository,
                                 TeacherDocumentRepository documentRepository) {
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
    }

    public AdminStatsDto getStats() {
        long pendingTeachers = userRepository.countByRoleAndStatus(Role.TEACHER, Status.PENDING);
        long pendingStudents = userRepository.countByRoleAndStatus(Role.STUDENT, Status.PENDING);
        long approvedTeachers = userRepository.countByRoleAndStatus(Role.TEACHER, Status.APPROVED);
        long approvedStudents = userRepository.countByRoleAndStatus(Role.STUDENT, Status.APPROVED);
        long totalDocuments = documentRepository.count();

        AdminStatsDto dto = new AdminStatsDto();
        dto.setPendingTeachers(pendingTeachers);
        dto.setPendingStudents(pendingStudents);
        dto.setApprovedUsers(approvedTeachers + approvedStudents);
        dto.setTotalDocuments(totalDocuments);
        dto.setAiQueriesToday(0);
        dto.setSystemHealth("Healthy");
        return dto;
    }

    public AiAnalyticsDto getAiAnalytics() {
        AiAnalyticsDto dto = new AiAnalyticsDto();
        dto.setTotalQuestions(0);
        dto.setAvgResponseMs(0);
        dto.setTopTeachers(List.of());
        dto.setTopDocuments(List.of());
        dto.setCategoryBreakdown(List.of(
                new AiCategoryDto("Science", 0),
                new AiCategoryDto("Math", 0),
                new AiCategoryDto("History", 0),
                new AiCategoryDto("Other", 0)
        ));
        return dto;
    }

    public List<ActivityLogDto> getActivityLogs() {
        return List.of(
                new ActivityLogDto(1, "System initialized", OffsetDateTime.now().toString(), "SYSTEM")
        );
    }
}

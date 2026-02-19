package com.sufi.approvalhub.service;

import com.sufi.approvalhub.domain.entity.StudentProfile;
import com.sufi.approvalhub.domain.entity.TeacherProfile;
import com.sufi.approvalhub.domain.entity.User;
import com.sufi.approvalhub.domain.enums.Role;
import com.sufi.approvalhub.domain.enums.Status;
import com.sufi.approvalhub.dto.admin.PendingStudentDto;
import com.sufi.approvalhub.dto.admin.PendingTeacherDto;
import com.sufi.approvalhub.exception.NotFoundException;
import com.sufi.approvalhub.mapper.StudentMapper;
import com.sufi.approvalhub.mapper.TeacherMapper;
import com.sufi.approvalhub.repository.StudentProfileRepository;
import com.sufi.approvalhub.repository.TeacherProfileRepository;
import com.sufi.approvalhub.repository.UserRepository;
import com.sufi.approvalhub.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminApprovalService {
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherMapper teacherMapper;
    private final StudentMapper studentMapper;

    public AdminApprovalService(UserRepository userRepository,
                                TeacherProfileRepository teacherProfileRepository,
                                StudentProfileRepository studentProfileRepository,
                                TeacherMapper teacherMapper,
                                StudentMapper studentMapper) {
        this.userRepository = userRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherMapper = teacherMapper;
        this.studentMapper = studentMapper;
    }

    @Transactional(readOnly = true)
    public List<PendingTeacherDto> getPendingTeachers() {
        List<TeacherProfile> profiles = teacherProfileRepository.findByUserStatus(Status.PENDING);
        return profiles.stream().map(teacherMapper::toPendingTeacherDto).toList();
    }

    @Transactional(readOnly = true)
    public List<PendingStudentDto> getPendingStudents() {
        List<StudentProfile> profiles = studentProfileRepository.findAll().stream()
                .filter(sp -> sp.getUser().getStatus() == Status.PENDING)
                .toList();
        return profiles.stream().map(studentMapper::toPendingStudentDto).toList();
    }

    @Transactional
    public void approveTeacher(Long userId) {
        User user = getUserOrThrow(userId, Role.TEACHER);
        approve(user);
    }

    @Transactional
    public void rejectTeacher(Long userId) {
        User user = getUserOrThrow(userId, Role.TEACHER);
        reject(user);
    }

    @Transactional
    public void approveStudent(Long userId) {
        User user = getUserOrThrow(userId, Role.STUDENT);
        approve(user);
    }

    @Transactional
    public void rejectStudent(Long userId) {
        User user = getUserOrThrow(userId, Role.STUDENT);
        reject(user);
    }

    private User getUserOrThrow(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getRole() != role) {
            throw new NotFoundException("User not found");
        }
        return user;
    }

    private void approve(User user) {
        Long approverId = SecurityUtils.getCurrentUser().getUser().getId();
        user.setStatus(Status.APPROVED);
        user.setApprovedByUserId(approverId);
        user.setApprovedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private void reject(User user) {
        Long approverId = SecurityUtils.getCurrentUser().getUser().getId();
        user.setStatus(Status.REJECTED);
        user.setApprovedByUserId(approverId);
        user.setApprovedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}

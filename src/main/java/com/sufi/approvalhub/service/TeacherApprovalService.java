package com.sufi.approvalhub.service;

import com.sufi.approvalhub.domain.entity.StudentProfile;
import com.sufi.approvalhub.domain.entity.TeacherProfile;
import com.sufi.approvalhub.domain.entity.User;
import com.sufi.approvalhub.domain.enums.Status;
import com.sufi.approvalhub.dto.teacher.TeacherProfileDto;
import com.sufi.approvalhub.dto.teacher.TeacherProfileUpdateRequest;
import com.sufi.approvalhub.dto.teacher.TeacherPendingStudentDto;
import com.sufi.approvalhub.exception.ForbiddenException;
import com.sufi.approvalhub.exception.NotFoundException;
import com.sufi.approvalhub.exception.BadRequestException;
import com.sufi.approvalhub.mapper.StudentMapper;
import com.sufi.approvalhub.repository.StudentProfileRepository;
import com.sufi.approvalhub.repository.TeacherProfileRepository;
import com.sufi.approvalhub.repository.UserRepository;
import com.sufi.approvalhub.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TeacherApprovalService {
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final UserRepository userRepository;
    private final StudentMapper studentMapper;

    public TeacherApprovalService(StudentProfileRepository studentProfileRepository,
                                  TeacherProfileRepository teacherProfileRepository,
                                  UserRepository userRepository,
                                  StudentMapper studentMapper) {
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.userRepository = userRepository;
        this.studentMapper = studentMapper;
    }

    @Transactional(readOnly = true)
    public TeacherProfileDto getCurrentTeacherProfileDto() {
        Long userId = SecurityUtils.getCurrentUser().getUser().getId();
        TeacherProfile profile = teacherProfileRepository.findByUserIdWithUser(userId)
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));
        User user = profile.getUser();

        TeacherProfileDto dto = new TeacherProfileDto();
        dto.setUserId(user.getId());
        dto.setProfileId(profile.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());
        dto.setTeacherCode(profile.getTeacherCode());
        dto.setDepartment(profile.getDepartment());
        dto.setCreatedAt(user.getCreatedAt());
        if (profile.getAvatarData() != null && profile.getAvatarContentType() != null) {
            dto.setAvatarUrl("data:" + profile.getAvatarContentType() + ";base64," + profile.getAvatarData());
        }
        return dto;
    }

    @Transactional
    public TeacherProfileDto updateCurrentTeacherProfile(TeacherProfileUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUser().getUser().getId();
        TeacherProfile profile = teacherProfileRepository.findByUserIdWithUser(userId)
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));
        User user = profile.getUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            if (request.getName().trim().length() < 2) {
                throw new BadRequestException("Name must be at least 2 characters");
            }
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            String phone = request.getPhone().trim();
            if (phone.length() > 20) {
                throw new BadRequestException("Phone number is too long");
            }
            user.setPhone(phone.isEmpty() ? null : phone);
        }
        if (request.getDepartment() != null) {
            String dept = request.getDepartment().trim();
            if (dept.length() > 100) {
                throw new BadRequestException("Department is too long");
            }
            profile.setDepartment(dept.isEmpty() ? null : dept);
        }

        teacherProfileRepository.save(profile);
        return getCurrentTeacherProfileDto();
    }

    @Transactional
    public TeacherProfileDto updateAvatar(byte[] data, String contentType) {
        if (data == null || data.length == 0) {
            throw new BadRequestException("Avatar file is required");
        }
        if (data.length > 2 * 1024 * 1024) {
            throw new BadRequestException("Avatar file must be <= 2MB");
        }
        if (contentType == null || (!contentType.equalsIgnoreCase("image/png") && !contentType.equalsIgnoreCase("image/jpeg"))) {
            throw new BadRequestException("Only PNG or JPG avatars are allowed");
        }

        Long userId = SecurityUtils.getCurrentUser().getUser().getId();
        TeacherProfile profile = teacherProfileRepository.findByUserIdWithUser(userId)
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));

        String base64 = java.util.Base64.getEncoder().encodeToString(data);
        profile.setAvatarData(base64);
        profile.setAvatarContentType(contentType);
        teacherProfileRepository.save(profile);
        return getCurrentTeacherProfileDto();
    }
    @Transactional(readOnly = true)
    public List<TeacherPendingStudentDto> getPendingStudentsForTeacher() {
        TeacherProfile teacherProfile = getCurrentTeacherProfile();
        List<StudentProfile> profiles = studentProfileRepository.findByAssignedTeacherId(teacherProfile.getId()).stream()
                .filter(sp -> sp.getUser().getStatus() == Status.PENDING)
                .toList();
        return profiles.stream().map(studentMapper::toTeacherPendingStudentDto).toList();
    }

    @Transactional
    public void approveStudent(Long userId) {
        StudentProfile studentProfile = getStudentProfile(userId);
        validateOwnership(studentProfile);
        approve(studentProfile.getUser());
    }

    @Transactional
    public void rejectStudent(Long userId) {
        StudentProfile studentProfile = getStudentProfile(userId);
        validateOwnership(studentProfile);
        reject(studentProfile.getUser());
    }

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Student not found"));
    }

    private void validateOwnership(StudentProfile studentProfile) {
        TeacherProfile teacherProfile = getCurrentTeacherProfile();
        if (!studentProfile.getAssignedTeacher().getId().equals(teacherProfile.getId())) {
            throw new ForbiddenException("Not allowed to manage this student");
        }
    }

    private TeacherProfile getCurrentTeacherProfile() {
        Long userId = SecurityUtils.getCurrentUser().getUser().getId();
        return teacherProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));
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

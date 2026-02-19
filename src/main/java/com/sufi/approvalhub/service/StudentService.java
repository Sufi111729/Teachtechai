package com.sufi.approvalhub.service;

import com.sufi.approvalhub.dto.student.StudentProfileDto;
import com.sufi.approvalhub.dto.teacher.document.TeacherDocumentAskResponse;
import com.sufi.approvalhub.exception.NotFoundException;
import com.sufi.approvalhub.mapper.StudentMapper;
import com.sufi.approvalhub.repository.StudentProfileRepository;
import com.sufi.approvalhub.security.SecurityUtils;
import com.sufi.approvalhub.service.document.TeacherDocumentService;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
    private final StudentProfileRepository studentProfileRepository;
    private final StudentMapper studentMapper;
    private final TeacherDocumentService teacherDocumentService;

    public StudentService(StudentProfileRepository studentProfileRepository,
                          StudentMapper studentMapper,
                          TeacherDocumentService teacherDocumentService) {
        this.studentProfileRepository = studentProfileRepository;
        this.studentMapper = studentMapper;
        this.teacherDocumentService = teacherDocumentService;
    }

    public StudentProfileDto getCurrentStudentProfile() {
        Long userId = SecurityUtils.getCurrentUser().getUser().getId();
        return studentProfileRepository.findByUserId(userId)
                .map(studentMapper::toStudentProfileDto)
                .orElseThrow(() -> new NotFoundException("Student profile not found"));
    }

    public TeacherDocumentAskResponse askAssignedTeacherAi(String question) {
        Long userId = SecurityUtils.getCurrentUser().getUser().getId();
        return studentProfileRepository.findByUserId(userId)
                .map(student -> teacherDocumentService.askQuestionForTeacher(student.getAssignedTeacher().getId(), question))
                .orElseThrow(() -> new NotFoundException("Student profile not found"));
    }
}

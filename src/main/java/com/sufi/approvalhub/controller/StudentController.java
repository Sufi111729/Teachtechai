package com.sufi.approvalhub.controller;

import com.sufi.approvalhub.dto.student.StudentProfileDto;
import com.sufi.approvalhub.dto.student.StudentAiAskRequest;
import com.sufi.approvalhub.dto.teacher.document.TeacherDocumentAskResponse;
import com.sufi.approvalhub.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me")
    public ResponseEntity<StudentProfileDto> me() {
        return ResponseEntity.ok(studentService.getCurrentStudentProfile());
    }

    @PostMapping("/ai/ask")
    public ResponseEntity<TeacherDocumentAskResponse> askTeacherAi(@RequestBody StudentAiAskRequest request) {
        return ResponseEntity.ok(studentService.askAssignedTeacherAi(request.getQuestion()));
    }
}

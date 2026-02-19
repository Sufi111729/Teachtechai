package com.sufi.approvalhub.controller;

import com.sufi.approvalhub.dto.auth.AuthResponse;
import com.sufi.approvalhub.dto.auth.LoginRequest;
import com.sufi.approvalhub.dto.auth.RegisterStudentRequest;
import com.sufi.approvalhub.dto.auth.RegisterTeacherRequest;
import com.sufi.approvalhub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register-teacher")
    public ResponseEntity<AuthResponse> registerTeacher(@Valid @RequestBody RegisterTeacherRequest request) {
        return ResponseEntity.ok(authService.registerTeacher(request));
    }

    @PostMapping("/register-student")
    public ResponseEntity<AuthResponse> registerStudent(@Valid @RequestBody RegisterStudentRequest request) {
        return ResponseEntity.ok(authService.registerStudent(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

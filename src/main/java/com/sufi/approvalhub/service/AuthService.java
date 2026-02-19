package com.sufi.approvalhub.service;

import com.sufi.approvalhub.domain.entity.StudentProfile;
import com.sufi.approvalhub.domain.entity.TeacherProfile;
import com.sufi.approvalhub.domain.entity.User;
import com.sufi.approvalhub.domain.enums.Role;
import com.sufi.approvalhub.domain.enums.Status;
import com.sufi.approvalhub.dto.auth.AuthResponse;
import com.sufi.approvalhub.dto.auth.LoginRequest;
import com.sufi.approvalhub.dto.auth.RegisterStudentRequest;
import com.sufi.approvalhub.dto.auth.RegisterTeacherRequest;
import com.sufi.approvalhub.exception.DuplicateException;
import com.sufi.approvalhub.exception.NotFoundException;
import com.sufi.approvalhub.security.JwtService;
import com.sufi.approvalhub.security.UserPrincipal;
import com.sufi.approvalhub.repository.StudentProfileRepository;
import com.sufi.approvalhub.repository.TeacherProfileRepository;
import com.sufi.approvalhub.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       TeacherProfileRepository teacherProfileRepository,
                       StudentProfileRepository studentProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse registerTeacher(RegisterTeacherRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateException("Email already in use");
        }
        if (teacherProfileRepository.existsByTeacherCode(request.getTeacherCode())) {
            throw new DuplicateException("Teacher code already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.TEACHER);
        user.setStatus(Status.PENDING);
        userRepository.save(user);

        TeacherProfile profile = new TeacherProfile();
        profile.setUser(user);
        profile.setTeacherCode(request.getTeacherCode());
        profile.setDepartment(request.getDepartment());
        teacherProfileRepository.save(profile);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse registerStudent(RegisterStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateException("Email already in use");
        }
        if (studentProfileRepository.existsByRollNo(request.getRollNo())) {
            throw new DuplicateException("Roll number already in use");
        }

        TeacherProfile assignedTeacher = teacherProfileRepository.findByTeacherCode(request.getTeacherCode())
                .orElseThrow(() -> new NotFoundException("Teacher code not found"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setStatus(Status.PENDING);
        userRepository.save(user);

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setRollNo(request.getRollNo());
        profile.setClassName(request.getClassName());
        profile.setSection(request.getSection());
        profile.setAssignedTeacher(assignedTeacher);
        studentProfileRepository.save(profile);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return buildAuthResponse(principal.getUser());
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal, Map.of(
                "role", user.getRole().name(),
                "status", user.getStatus().name(),
                "userId", user.getId()
        ));
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());

        if (user.getRole() == Role.TEACHER) {
            Optional<TeacherProfile> profile = teacherProfileRepository.findByUserId(user.getId());
            profile.ifPresent(p -> response.setTeacherProfileId(p.getId()));
        }
        return response;
    }
}

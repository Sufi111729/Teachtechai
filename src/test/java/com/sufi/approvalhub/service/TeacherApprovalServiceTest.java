package com.sufi.approvalhub.service;

import com.sufi.approvalhub.domain.entity.StudentProfile;
import com.sufi.approvalhub.domain.entity.TeacherProfile;
import com.sufi.approvalhub.domain.entity.User;
import com.sufi.approvalhub.domain.enums.Role;
import com.sufi.approvalhub.domain.enums.Status;
import com.sufi.approvalhub.exception.ForbiddenException;
import com.sufi.approvalhub.mapper.StudentMapper;
import com.sufi.approvalhub.repository.StudentProfileRepository;
import com.sufi.approvalhub.repository.TeacherProfileRepository;
import com.sufi.approvalhub.repository.UserRepository;
import com.sufi.approvalhub.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@org.junit.jupiter.api.extension.ExtendWith(MockitoExtension.class)
class TeacherApprovalServiceTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private TeacherProfileRepository teacherProfileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentMapper studentMapper;

    @InjectMocks
    private TeacherApprovalService service;

    private User teacherUser;
    private TeacherProfile teacherProfile;

    @BeforeEach
    void setup() {
        teacherUser = new User();
        teacherUser.setId(10L);
        teacherUser.setRole(Role.TEACHER);
        teacherUser.setStatus(Status.APPROVED);

        teacherProfile = new TeacherProfile();
        teacherProfile.setId(100L);
        teacherProfile.setUser(teacherUser);
        teacherProfile.setTeacherCode("T001");

        UserPrincipal principal = new UserPrincipal(teacherUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    @AfterEach
    void teardown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void approveStudent_whenAssignedTeacherMismatch_shouldThrowForbidden() {
        User studentUser = new User();
        studentUser.setId(20L);
        studentUser.setRole(Role.STUDENT);
        studentUser.setStatus(Status.PENDING);

        TeacherProfile otherTeacher = new TeacherProfile();
        otherTeacher.setId(200L);
        otherTeacher.setTeacherCode("T999");

        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setUser(studentUser);
        studentProfile.setAssignedTeacher(otherTeacher);

        when(teacherProfileRepository.findByUserId(teacherUser.getId())).thenReturn(Optional.of(teacherProfile));
        when(studentProfileRepository.findByUserId(studentUser.getId())).thenReturn(Optional.of(studentProfile));

        assertThrows(ForbiddenException.class, () -> service.approveStudent(studentUser.getId()));
        verify(userRepository, never()).save(any());
    }
}

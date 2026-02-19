package com.sufi.approvalhub.service;

import com.sufi.approvalhub.domain.entity.User;
import com.sufi.approvalhub.domain.enums.Role;
import com.sufi.approvalhub.domain.enums.Status;
import com.sufi.approvalhub.mapper.StudentMapper;
import com.sufi.approvalhub.mapper.TeacherMapper;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.mockito.Mockito.*;

@org.junit.jupiter.api.extension.ExtendWith(MockitoExtension.class)
class AdminApprovalServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private TeacherProfileRepository teacherProfileRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private TeacherMapper teacherMapper;
    @Mock
    private StudentMapper studentMapper;

    @InjectMocks
    private AdminApprovalService service;

    @BeforeEach
    void setup() {
        User admin = new User();
        admin.setId(1L);
        admin.setRole(Role.ADMIN);
        admin.setStatus(Status.APPROVED);
        UserPrincipal principal = new UserPrincipal(admin);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    @AfterEach
    void teardown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void approveTeacher_shouldSetApprovedStatus() {
        User teacher = new User();
        teacher.setId(2L);
        teacher.setRole(Role.TEACHER);
        teacher.setStatus(Status.PENDING);
        when(userRepository.findById(teacher.getId())).thenReturn(Optional.of(teacher));

        service.approveTeacher(teacher.getId());

        verify(userRepository, times(1)).save(argThat(u -> u.getStatus() == Status.APPROVED && u.getApprovedByUserId() == 1L));
    }
}

package com.sufi.approvalhub.repository;

import com.sufi.approvalhub.domain.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    boolean existsByRollNo(String rollNo);

    Optional<StudentProfile> findByUserId(Long userId);

    List<StudentProfile> findByAssignedTeacherId(Long teacherProfileId);
}

package com.sufi.approvalhub.repository;

import com.sufi.approvalhub.domain.entity.TeacherProfile;
import com.sufi.approvalhub.domain.enums.Status;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {
    Optional<TeacherProfile> findByTeacherCode(String teacherCode);

    boolean existsByTeacherCode(String teacherCode);

    Optional<TeacherProfile> findByUserId(Long userId);

    @Query("select tp from TeacherProfile tp join fetch tp.user u where u.status = :status")
    List<TeacherProfile> findByUserStatus(@Param("status") Status status);

    @Query("select tp from TeacherProfile tp join fetch tp.user u where u.id = :userId")
    Optional<TeacherProfile> findByUserIdWithUser(@Param("userId") Long userId);
}

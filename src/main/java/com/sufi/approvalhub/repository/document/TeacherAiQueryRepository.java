package com.sufi.approvalhub.repository.document;

import com.sufi.approvalhub.domain.entity.document.TeacherAiQuery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherAiQueryRepository extends JpaRepository<TeacherAiQuery, Long> {
    List<TeacherAiQuery> findTop20ByTeacherIdOrderByCreatedAtDesc(Long teacherId);
}

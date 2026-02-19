package com.sufi.approvalhub.repository.document;

import com.sufi.approvalhub.domain.entity.document.TeacherDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TeacherDocumentRepository extends JpaRepository<TeacherDocument, Long> {
    List<TeacherDocument> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    Optional<TeacherDocument> findByIdAndTeacherId(Long id, Long teacherId);

    @Query("select count(c) from TeacherDocumentChunk c where c.document.id = :documentId")
    long countChunksByDocumentId(Long documentId);
}

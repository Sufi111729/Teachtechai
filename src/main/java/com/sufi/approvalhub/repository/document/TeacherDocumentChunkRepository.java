package com.sufi.approvalhub.repository.document;

import com.sufi.approvalhub.domain.entity.document.TeacherDocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeacherDocumentChunkRepository extends JpaRepository<TeacherDocumentChunk, Long> {
    List<TeacherDocumentChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);

    @Query(value = "select * from teacher_document_chunks where document_id = :documentId and match(chunk_text) against (:query in natural language mode)", nativeQuery = true)
    List<TeacherDocumentChunk> searchFullText(@Param("documentId") Long documentId,
                                              @Param("query") String query,
                                              Pageable pageable);

    @Query(value = "select * from teacher_document_chunks where document_id = :documentId and chunk_text like :pattern", nativeQuery = true)
    List<TeacherDocumentChunk> searchLike(@Param("documentId") Long documentId,
                                          @Param("pattern") String pattern,
                                          Pageable pageable);

    @Query(value = "select c.* from teacher_document_chunks c " +
            "join teacher_documents d on c.document_id = d.id " +
            "where d.teacher_id = :teacherId and match(c.chunk_text) against (:query in natural language mode)",
            nativeQuery = true)
    List<TeacherDocumentChunk> searchFullTextByTeacher(@Param("teacherId") Long teacherId,
                                                       @Param("query") String query,
                                                       Pageable pageable);

    @Query(value = "select c.* from teacher_document_chunks c " +
            "join teacher_documents d on c.document_id = d.id " +
            "where d.teacher_id = :teacherId and c.chunk_text like :pattern",
            nativeQuery = true)
    List<TeacherDocumentChunk> searchLikeByTeacher(@Param("teacherId") Long teacherId,
                                                   @Param("pattern") String pattern,
                                                   Pageable pageable);
}

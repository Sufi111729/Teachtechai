package com.sufi.approvalhub.domain.entity.document;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_document_sections")
public class TeacherDocumentSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private TeacherDocument document;

    @Column(name = "section_index", nullable = false)
    private Integer sectionIndex;

    @Column(name = "ai_section_id", nullable = false, unique = true, length = 40)
    private String aiSectionId;

    @Column(name = "title", nullable = false)
    private String title;

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "char_count", nullable = false)
    private Integer charCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public TeacherDocumentSection() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TeacherDocument getDocument() {
        return document;
    }

    public void setDocument(TeacherDocument document) {
        this.document = document;
    }

    public Integer getSectionIndex() {
        return sectionIndex;
    }

    public void setSectionIndex(Integer sectionIndex) {
        this.sectionIndex = sectionIndex;
    }

    public String getAiSectionId() {
        return aiSectionId;
    }

    public void setAiSectionId(String aiSectionId) {
        this.aiSectionId = aiSectionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getCharCount() {
        return charCount;
    }

    public void setCharCount(Integer charCount) {
        this.charCount = charCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

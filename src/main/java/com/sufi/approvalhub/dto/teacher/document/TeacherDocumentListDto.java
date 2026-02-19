package com.sufi.approvalhub.dto.teacher.document;

import java.time.LocalDateTime;

public class TeacherDocumentListDto {
    private Long id;
    private String title;
    private String fileName;
    private LocalDateTime createdAt;
    private long chunkCount;

    public TeacherDocumentListDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(long chunkCount) {
        this.chunkCount = chunkCount;
    }
}

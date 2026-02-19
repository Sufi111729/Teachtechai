package com.sufi.approvalhub.dto.teacher.document;

import java.time.LocalDateTime;

public class TeacherDocumentUploadResponse {
    private Long documentId;
    private int chunkCount;
    private LocalDateTime createdAt;

    public TeacherDocumentUploadResponse() {
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public int getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(int chunkCount) {
        this.chunkCount = chunkCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

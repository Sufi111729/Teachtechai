package com.sufi.approvalhub.dto.teacher.document;

import java.time.LocalDateTime;

public class TeacherDocumentDetailDto {
    private Long id;
    private String title;
    private String fileName;
    private String mimeType;
    private Long fileSize;
    private LocalDateTime createdAt;
    private long chunkCount;

    public TeacherDocumentDetailDto() {
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

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
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

package com.sufi.approvalhub.dto.teacher.document;

public class TeacherDocumentUsedChunkDto {
    private Integer chunkIndex;
    private String preview;

    public TeacherDocumentUsedChunkDto() {
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getPreview() {
        return preview;
    }

    public void setPreview(String preview) {
        this.preview = preview;
    }
}

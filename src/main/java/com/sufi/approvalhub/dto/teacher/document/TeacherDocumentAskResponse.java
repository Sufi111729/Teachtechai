package com.sufi.approvalhub.dto.teacher.document;

import java.util.List;

public class TeacherDocumentAskResponse {
    private Long documentId;
    private String answer;
    private List<TeacherDocumentUsedChunkDto> usedChunks;

    public TeacherDocumentAskResponse() {
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<TeacherDocumentUsedChunkDto> getUsedChunks() {
        return usedChunks;
    }

    public void setUsedChunks(List<TeacherDocumentUsedChunkDto> usedChunks) {
        this.usedChunks = usedChunks;
    }
}

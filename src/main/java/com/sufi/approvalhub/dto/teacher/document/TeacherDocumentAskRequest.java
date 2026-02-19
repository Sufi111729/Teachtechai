package com.sufi.approvalhub.dto.teacher.document;

import jakarta.validation.constraints.NotBlank;

public class TeacherDocumentAskRequest {
    @NotBlank
    private String question;

    public TeacherDocumentAskRequest() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}

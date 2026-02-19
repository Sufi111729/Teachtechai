package com.sufi.approvalhub.dto.teacher.document;

public class TeacherDocumentNoteRequest {
    private String title;
    private String content;

    public TeacherDocumentNoteRequest() {
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
}

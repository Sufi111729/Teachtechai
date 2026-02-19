package com.sufi.approvalhub.dto.admin.analytics;

public class AiTopDocumentDto {
    private String title;
    private long count;

    public AiTopDocumentDto() {
    }

    public AiTopDocumentDto(String title, long count) {
        this.title = title;
        this.count = count;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}

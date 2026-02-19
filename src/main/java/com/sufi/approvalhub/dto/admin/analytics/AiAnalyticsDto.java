package com.sufi.approvalhub.dto.admin.analytics;

import java.util.List;

public class AiAnalyticsDto {
    private long totalQuestions;
    private long avgResponseMs;
    private List<AiTopTeacherDto> topTeachers;
    private List<AiTopDocumentDto> topDocuments;
    private List<AiCategoryDto> categoryBreakdown;

    public AiAnalyticsDto() {
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public long getAvgResponseMs() {
        return avgResponseMs;
    }

    public void setAvgResponseMs(long avgResponseMs) {
        this.avgResponseMs = avgResponseMs;
    }

    public List<AiTopTeacherDto> getTopTeachers() {
        return topTeachers;
    }

    public void setTopTeachers(List<AiTopTeacherDto> topTeachers) {
        this.topTeachers = topTeachers;
    }

    public List<AiTopDocumentDto> getTopDocuments() {
        return topDocuments;
    }

    public void setTopDocuments(List<AiTopDocumentDto> topDocuments) {
        this.topDocuments = topDocuments;
    }

    public List<AiCategoryDto> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<AiCategoryDto> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }
}

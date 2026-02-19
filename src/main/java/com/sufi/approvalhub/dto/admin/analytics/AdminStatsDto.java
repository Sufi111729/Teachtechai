package com.sufi.approvalhub.dto.admin.analytics;

public class AdminStatsDto {
    private long pendingTeachers;
    private long pendingStudents;
    private long approvedUsers;
    private long totalDocuments;
    private long aiQueriesToday;
    private String systemHealth;

    public AdminStatsDto() {
    }

    public long getPendingTeachers() {
        return pendingTeachers;
    }

    public void setPendingTeachers(long pendingTeachers) {
        this.pendingTeachers = pendingTeachers;
    }

    public long getPendingStudents() {
        return pendingStudents;
    }

    public void setPendingStudents(long pendingStudents) {
        this.pendingStudents = pendingStudents;
    }

    public long getApprovedUsers() {
        return approvedUsers;
    }

    public void setApprovedUsers(long approvedUsers) {
        this.approvedUsers = approvedUsers;
    }

    public long getTotalDocuments() {
        return totalDocuments;
    }

    public void setTotalDocuments(long totalDocuments) {
        this.totalDocuments = totalDocuments;
    }

    public long getAiQueriesToday() {
        return aiQueriesToday;
    }

    public void setAiQueriesToday(long aiQueriesToday) {
        this.aiQueriesToday = aiQueriesToday;
    }

    public String getSystemHealth() {
        return systemHealth;
    }

    public void setSystemHealth(String systemHealth) {
        this.systemHealth = systemHealth;
    }
}

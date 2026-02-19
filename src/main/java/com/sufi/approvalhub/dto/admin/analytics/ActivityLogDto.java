package com.sufi.approvalhub.dto.admin.analytics;

public class ActivityLogDto {
    private long id;
    private String description;
    private String timestamp;
    private String type;

    public ActivityLogDto() {
    }

    public ActivityLogDto(long id, String description, String timestamp, String type) {
        this.id = id;
        this.description = description;
        this.timestamp = timestamp;
        this.type = type;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}

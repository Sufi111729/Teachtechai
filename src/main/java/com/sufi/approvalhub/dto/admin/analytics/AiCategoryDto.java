package com.sufi.approvalhub.dto.admin.analytics;

public class AiCategoryDto {
    private String name;
    private long value;

    public AiCategoryDto() {
    }

    public AiCategoryDto(String name, long value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getValue() {
        return value;
    }

    public void setValue(long value) {
        this.value = value;
    }
}

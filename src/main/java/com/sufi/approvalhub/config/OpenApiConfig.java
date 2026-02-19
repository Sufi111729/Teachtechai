package com.sufi.approvalhub.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI approvalHubOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ApprovalHub API")
                        .version("v1")
                        .description("Admin/Teacher/Student Approval System API"));
    }
}

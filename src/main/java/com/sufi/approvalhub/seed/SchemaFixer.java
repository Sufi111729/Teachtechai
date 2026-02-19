package com.sufi.approvalhub.seed;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(SchemaFixer.class);
    private final JdbcTemplate jdbcTemplate;

    public SchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("SchemaFixer starting");
        forceLongText("teacher_documents", "full_text");
        forceLongText("teacher_document_chunks", "chunk_text");
        forceLongText("teacher_document_sections", "content");
        forceLongText("teacher_profiles", "avatar_data");
        forceLongText("teacher_ai_queries", "question");
        forceLongText("teacher_ai_queries", "answer");
        log.info("SchemaFixer completed");
    }

    private void forceLongText(String table, String column) {
        try {
            if (!tableExists(table) || !columnExists(table, column)) {
                log.info("SchemaFixer skip {}.{} (missing)", table, column);
                return;
            }
            String sql = "ALTER TABLE " + table + " MODIFY " + column + " LONGTEXT";
            jdbcTemplate.execute(sql);
            log.info("Altered {}.{} to LONGTEXT (or already longtext)", table, column);
        } catch (Exception ex) {
            log.warn("Schema fix skipped for {}.{}: {}", table, column, ex.getMessage());
        }
    }

    private boolean tableExists(String table) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                Integer.class, table);
        return count != null && count > 0;
    }

    private boolean columnExists(String table, String column) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class, table, column);
        return count != null && count > 0;
    }
}

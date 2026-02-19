package com.sufi.approvalhub.service.document;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DocumentChunker {
    private static final int MIN_CHUNK_CHARS = 6000;
    private static final int MAX_CHUNK_CHARS = 9000;
    private static final int MAX_HEADING_CHARS = 120;
    private static final List<String> HEADING_PREFIXES = Arrays.asList(
            "CHAPTER",
            "UNIT",
            "SECTION",
            "PART",
            "APPENDIX",
            "INTRODUCTION",
            "ABSTRACT",
            "SUMMARY",
            "CONCLUSION"
    );

    public static class Section {
        private final String title;
        private final String content;

        public Section(String title, String content) {
            this.title = title;
            this.content = content;
        }

        public String getTitle() {
            return title;
        }

        public String getContent() {
            return content;
        }
    }

    public String normalize(String text) {
        if (text == null) {
            return "";
        }
        String normalized = text.replaceAll("\\r", "\n");
        normalized = normalized.replaceAll("[ \t]+", " ");
        normalized = normalized.replaceAll("\n{3,}", "\n\n");
        return normalized.trim();
    }

    public List<Section> splitByHeadings(String normalizedText) {
        List<Section> sections = new ArrayList<>();
        if (normalizedText.isBlank()) {
            return sections;
        }

        String[] paragraphs = normalizedText.split("\\n\\n+");
        String currentTitle = "Document";
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            String cleaned = paragraph.trim();
            if (cleaned.isEmpty()) {
                continue;
            }

            if (isHeading(cleaned)) {
                flushSection(sections, currentTitle, current);
                currentTitle = cleaned;
                continue;
            }

            if (current.length() > 0) {
                current.append("\n\n");
            }
            current.append(cleaned);
        }

        flushSection(sections, currentTitle, current);
        return sections;
    }

    public List<String> chunk(String normalizedText) {
        List<String> chunks = new ArrayList<>();
        if (normalizedText.isBlank()) {
            return chunks;
        }

        String[] paragraphs = normalizedText.split("\\n\\n+");
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            String cleaned = paragraph.trim();
            if (cleaned.isEmpty()) {
                continue;
            }
            if (cleaned.length() > MAX_CHUNK_CHARS) {
                flushChunk(chunks, current);
                splitLongParagraph(cleaned, chunks);
                continue;
            }

            if (current.length() + cleaned.length() + 2 > MAX_CHUNK_CHARS) {
                flushChunk(chunks, current);
            }

            if (current.length() > 0) {
                current.append("\n\n");
            }
            current.append(cleaned);

            if (current.length() >= MIN_CHUNK_CHARS) {
                flushChunk(chunks, current);
            }
        }

        flushChunk(chunks, current);
        return chunks;
    }

    private void splitLongParagraph(String paragraph, List<String> chunks) {
        String[] sentences = paragraph.split("(?<=[.!?])\\s+");
        StringBuilder current = new StringBuilder();
        for (String sentence : sentences) {
            if (sentence.length() > MAX_CHUNK_CHARS) {
                flushChunk(chunks, current);
                hardSplit(sentence, chunks);
                continue;
            }
            if (current.length() + sentence.length() + 1 > MAX_CHUNK_CHARS) {
                flushChunk(chunks, current);
            }
            if (current.length() > 0) {
                current.append(" ");
            }
            current.append(sentence.trim());
        }
        flushChunk(chunks, current);
    }

    private void hardSplit(String text, List<String> chunks) {
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + MAX_CHUNK_CHARS, text.length());
            String part = text.substring(start, end).trim();
            if (!part.isEmpty()) {
                chunks.add(part);
            }
            start = end;
        }
    }

    private void flushChunk(List<String> chunks, StringBuilder current) {
        if (current.length() == 0) {
            return;
        }
        String chunk = current.toString().trim();
        if (!chunk.isEmpty()) {
            chunks.add(chunk);
        }
        current.setLength(0);
    }

    private void flushSection(List<Section> sections, String title, StringBuilder current) {
        String content = current.toString().trim();
        if (!content.isEmpty()) {
            sections.add(new Section(title, content));
        }
        current.setLength(0);
    }

    private boolean isHeading(String line) {
        if (line.length() > MAX_HEADING_CHARS) {
            return false;
        }

        String upper = line.toUpperCase();
        boolean hasLetters = line.chars().anyMatch(Character::isLetter);
        boolean mostlyUpper = hasLetters && upper.equals(line);
        boolean numericPrefix = line.matches("^\\d+(\\.\\d+)*\\s+.*");
        boolean keywordPrefix = HEADING_PREFIXES.stream().anyMatch(prefix -> upper.startsWith(prefix + " "));
        boolean endsWithColon = line.endsWith(":");
        boolean shortTitleCase = line.split("\\s+").length <= 6
                && Character.isLetter(line.charAt(0))
                && Character.isUpperCase(line.charAt(0))
                && !line.endsWith(".")
                && !line.endsWith("?");

        return mostlyUpper || numericPrefix || keywordPrefix || endsWithColon || shortTitleCase;
    }
}

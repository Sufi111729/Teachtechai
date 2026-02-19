package com.sufi.approvalhub.service.document;

import com.sufi.approvalhub.domain.entity.TeacherProfile;
import com.sufi.approvalhub.domain.entity.document.TeacherDocument;
import com.sufi.approvalhub.domain.entity.document.TeacherDocumentChunk;
import com.sufi.approvalhub.domain.entity.document.TeacherDocumentSection;
import com.sufi.approvalhub.domain.entity.document.TeacherAiQuery;
import com.sufi.approvalhub.dto.teacher.document.*;
import com.sufi.approvalhub.exception.BadRequestException;
import com.sufi.approvalhub.exception.NotFoundException;
import com.sufi.approvalhub.repository.TeacherProfileRepository;
import com.sufi.approvalhub.repository.document.TeacherDocumentChunkRepository;
import com.sufi.approvalhub.repository.document.TeacherDocumentRepository;
import com.sufi.approvalhub.repository.document.TeacherAiQueryRepository;
import com.sufi.approvalhub.repository.document.TeacherDocumentSectionRepository;
import com.sufi.approvalhub.security.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherDocumentService {
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;
    private static final int MAX_NOTE_CHARS = 200_000;
    private static final int MAX_CHUNKS_FOR_AI = 6;

    private final TeacherProfileRepository teacherProfileRepository;
    private final TeacherDocumentRepository teacherDocumentRepository;
    private final TeacherDocumentChunkRepository chunkRepository;
    private final TeacherDocumentSectionRepository sectionRepository;
    private final TeacherAiQueryRepository aiQueryRepository;
    private final DocumentTextExtractor textExtractor;
    private final DocumentChunker chunker;
    private final AiClient aiClient;
    private final boolean fullTextEnabled;

    public TeacherDocumentService(TeacherProfileRepository teacherProfileRepository,
                                  TeacherDocumentRepository teacherDocumentRepository,
                                  TeacherDocumentChunkRepository chunkRepository,
                                  TeacherDocumentSectionRepository sectionRepository,
                                  TeacherAiQueryRepository aiQueryRepository,
                                  DocumentTextExtractor textExtractor,
                                  AiClient aiClient,
                                  @Value("${app.search.fulltext-enabled:false}") boolean fullTextEnabled) {
        this.teacherProfileRepository = teacherProfileRepository;
        this.teacherDocumentRepository = teacherDocumentRepository;
        this.chunkRepository = chunkRepository;
        this.sectionRepository = sectionRepository;
        this.aiQueryRepository = aiQueryRepository;
        this.textExtractor = textExtractor;
        this.chunker = new DocumentChunker();
        this.aiClient = aiClient;
        this.fullTextEnabled = fullTextEnabled;
    }

    @Transactional
    public TeacherDocumentUploadResponse uploadDocument(MultipartFile file, String title) {
        validateFile(file);
        TeacherProfile teacherProfile = getCurrentTeacherProfile();

        String rawText = textExtractor.extractText(file);
        String fileName = Optional.ofNullable(file.getOriginalFilename()).orElse("document");
        String mimeType = Optional.ofNullable(file.getContentType()).orElse("application/octet-stream");
        return saveDocumentFromText(teacherProfile, title, fileName, mimeType, file.getSize(), rawText);
    }

    @Transactional
    public TeacherDocumentUploadResponse createNote(String title, String content) {
        TeacherProfile teacherProfile = getCurrentTeacherProfile();
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Note content is required");
        }
        if (content.length() > MAX_NOTE_CHARS) {
            throw new BadRequestException("Note is too long (max 200k characters)");
        }
        String noteTitle = (title == null || title.isBlank()) ? "Teacher Note" : title.trim();
        return saveDocumentFromText(
                teacherProfile,
                noteTitle,
                noteTitle + ".txt",
                "text/plain",
                content.length(),
                content
        );
    }

    private TeacherDocumentUploadResponse saveDocumentFromText(TeacherProfile teacherProfile,
                                                               String title,
                                                               String fileName,
                                                               String mimeType,
                                                               long fileSize,
                                                               String rawText) {
        String normalized = chunker.normalize(rawText);
        if (normalized.isBlank()) {
            throw new BadRequestException("Document contains no readable text");
        }

        TeacherDocument document = new TeacherDocument();
        document.setTeacher(teacherProfile);
        document.setTitle(title);
        document.setFileName(fileName);
        document.setMimeType(mimeType);
        document.setFileSize(fileSize);
        document.setFullText(normalized);
        teacherDocumentRepository.save(document);

        List<DocumentChunker.Section> sections = chunker.splitByHeadings(normalized);
        if (sections.isEmpty()) {
            sections = List.of(new DocumentChunker.Section("Document", normalized));
        }

        int sectionIndex = 0;
        int chunkIndex = 0;
        for (DocumentChunker.Section section : sections) {
            TeacherDocumentSection sectionEntity = new TeacherDocumentSection();
            sectionEntity.setDocument(document);
            sectionEntity.setSectionIndex(sectionIndex++);
            sectionEntity.setAiSectionId(UUID.randomUUID().toString());
            sectionEntity.setTitle(section.getTitle());
            sectionEntity.setContent(section.getContent());
            sectionEntity.setCharCount(section.getContent().length());
            sectionRepository.save(sectionEntity);

            List<String> sectionChunks = chunker.chunk(section.getContent());
            for (String chunkText : sectionChunks) {
                TeacherDocumentChunk chunk = new TeacherDocumentChunk();
                chunk.setDocument(document);
                chunk.setChunkIndex(chunkIndex++);
                chunk.setChunkText(chunkText);
                chunk.setChunkCharCount(chunkText.length());
                chunkRepository.save(chunk);
            }
        }

        if (chunkIndex == 0) {
            throw new BadRequestException("Unable to split document into chunks");
        }

        TeacherDocumentUploadResponse response = new TeacherDocumentUploadResponse();
        response.setDocumentId(document.getId());
        response.setChunkCount(chunkIndex);
        response.setCreatedAt(document.getCreatedAt());
        return response;
    }

    public List<TeacherDocumentListDto> listDocuments() {
        TeacherProfile teacherProfile = getCurrentTeacherProfile();
        return teacherDocumentRepository.findByTeacherIdOrderByCreatedAtDesc(teacherProfile.getId()).stream()
                .map(doc -> {
                    TeacherDocumentListDto dto = new TeacherDocumentListDto();
                    dto.setId(doc.getId());
                    dto.setTitle(doc.getTitle());
                    dto.setFileName(doc.getFileName());
                    dto.setCreatedAt(doc.getCreatedAt());
                    dto.setChunkCount(teacherDocumentRepository.countChunksByDocumentId(doc.getId()));
                    return dto;
                })
                .toList();
    }

    public TeacherDocumentDetailDto getDocument(Long documentId) {
        TeacherDocument document = getDocumentForTeacher(documentId);
        TeacherDocumentDetailDto dto = new TeacherDocumentDetailDto();
        dto.setId(document.getId());
        dto.setTitle(document.getTitle());
        dto.setFileName(document.getFileName());
        dto.setMimeType(document.getMimeType());
        dto.setFileSize(document.getFileSize());
        dto.setCreatedAt(document.getCreatedAt());
        dto.setChunkCount(teacherDocumentRepository.countChunksByDocumentId(document.getId()));
        return dto;
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        TeacherDocument document = getDocumentForTeacher(documentId);
        teacherDocumentRepository.delete(document);
    }

    @Transactional
    public TeacherDocumentAskResponse askQuestion(Long documentId, String question) {
        if (question == null || question.isBlank()) {
            throw new BadRequestException("Question is required");
        }

        TeacherDocument document = getDocumentForTeacher(documentId);
        List<TeacherDocumentChunk> chunks = findRelevantChunks(document.getId(), question);
        if (chunks.isEmpty()) {
            TeacherDocumentAskResponse response = new TeacherDocumentAskResponse();
            response.setDocumentId(document.getId());
            response.setAnswer("I don't know based on the provided document.");
            response.setUsedChunks(List.of());
            return response;
        }

        String systemPrompt = "Answer strictly from the provided context. If the answer is not present, say you don't know.";
        String context = chunks.stream()
                .map(c -> "[Chunk " + c.getChunkIndex() + "]\n" + c.getChunkText())
                .collect(Collectors.joining("\n\n"));
        String userPrompt = "Context:\n" + context + "\n\nQuestion: " + question;

        String answer = aiClient.answer(systemPrompt, userPrompt);
        saveAiQuery(document, question, answer);

        TeacherDocumentAskResponse response = new TeacherDocumentAskResponse();
        response.setDocumentId(document.getId());
        response.setAnswer(answer);
        response.setUsedChunks(chunks.stream().map(this::toUsedChunk).toList());
        return response;
    }

    @Transactional(readOnly = true)
    public TeacherDocumentAskResponse askQuestionForTeacher(Long teacherId, String question) {
        if (question == null || question.isBlank()) {
            throw new BadRequestException("Question is required");
        }

        List<TeacherDocumentChunk> chunks = findRelevantChunksForTeacher(teacherId, question);
        if (chunks.isEmpty()) {
            TeacherDocumentAskResponse response = new TeacherDocumentAskResponse();
            response.setDocumentId(0L);
            response.setAnswer("I don't know based on the provided document.");
            response.setUsedChunks(List.of());
            return response;
        }

        String systemPrompt = "Answer strictly from the provided context. If the answer is not present, say you don't know.";
        String context = chunks.stream()
                .map(c -> "[Doc " + c.getDocument().getId() + " / Chunk " + c.getChunkIndex() + "]\n" + c.getChunkText())
                .collect(Collectors.joining("\n\n"));
        String userPrompt = "Context:\n" + context + "\n\nQuestion: " + question;

        String answer = aiClient.answer(systemPrompt, userPrompt);

        TeacherDocumentAskResponse response = new TeacherDocumentAskResponse();
        response.setDocumentId(chunks.get(0).getDocument().getId());
        response.setAnswer(answer);
        response.setUsedChunks(chunks.stream().map(this::toUsedChunk).toList());
        return response;
    }

    @Transactional(readOnly = true)
    public List<TeacherAiQueryDto> getRecentAiQueries() {
        TeacherProfile teacherProfile = getCurrentTeacherProfile();
        return aiQueryRepository.findTop20ByTeacherIdOrderByCreatedAtDesc(teacherProfile.getId()).stream()
                .map(q -> {
                    TeacherAiQueryDto dto = new TeacherAiQueryDto();
                    dto.setId(q.getId());
                    dto.setDocumentId(q.getDocument().getId());
                    dto.setDocumentTitle(q.getDocument().getTitle());
                    dto.setQuestion(q.getQuestion());
                    dto.setAnswer(q.getAnswer());
                    dto.setCreatedAt(q.getCreatedAt());
                    return dto;
                })
                .toList();
    }

    private void saveAiQuery(TeacherDocument document, String question, String answer) {
        TeacherProfile teacherProfile = getCurrentTeacherProfile();
        TeacherAiQuery query = new TeacherAiQuery();
        query.setTeacher(teacherProfile);
        query.setDocument(document);
        query.setQuestion(question);
        query.setAnswer(answer);
        aiQueryRepository.save(query);
    }

    private TeacherDocumentUsedChunkDto toUsedChunk(TeacherDocumentChunk chunk) {
        TeacherDocumentUsedChunkDto dto = new TeacherDocumentUsedChunkDto();
        dto.setChunkIndex(chunk.getChunkIndex());
        String preview = chunk.getChunkText();
        if (preview.length() > 200) {
            preview = preview.substring(0, 200) + "...";
        }
        dto.setPreview(preview);
        return dto;
    }

    private List<TeacherDocumentChunk> findRelevantChunks(Long documentId, String question) {
        if (fullTextEnabled) {
            return chunkRepository.searchFullText(documentId, question, PageRequest.of(0, MAX_CHUNKS_FOR_AI));
        }

        List<String> keywords = extractKeywords(question);
        Map<Long, TeacherDocumentChunk> seen = new LinkedHashMap<>();

        for (String keyword : keywords) {
            List<TeacherDocumentChunk> matches = chunkRepository.searchLike(documentId, "%" + keyword + "%", PageRequest.of(0, MAX_CHUNKS_FOR_AI));
            for (TeacherDocumentChunk chunk : matches) {
                seen.putIfAbsent(chunk.getId(), chunk);
            }
        }

        if (seen.isEmpty()) {
            return List.of();
        }

        List<TeacherDocumentChunk> scored = new ArrayList<>(seen.values());
        scored.sort(Comparator.comparingInt(c -> -scoreChunk(c.getChunkText(), keywords)));

        return scored.stream().limit(MAX_CHUNKS_FOR_AI).toList();
    }

    private List<TeacherDocumentChunk> findRelevantChunksForTeacher(Long teacherId, String question) {
        if (fullTextEnabled) {
            return chunkRepository.searchFullTextByTeacher(teacherId, question, PageRequest.of(0, MAX_CHUNKS_FOR_AI));
        }

        List<String> keywords = extractKeywords(question);
        Map<Long, TeacherDocumentChunk> seen = new LinkedHashMap<>();

        for (String keyword : keywords) {
            List<TeacherDocumentChunk> matches = chunkRepository.searchLikeByTeacher(teacherId, "%" + keyword + "%", PageRequest.of(0, MAX_CHUNKS_FOR_AI));
            for (TeacherDocumentChunk chunk : matches) {
                seen.putIfAbsent(chunk.getId(), chunk);
            }
        }

        if (seen.isEmpty()) {
            return List.of();
        }

        List<TeacherDocumentChunk> scored = new ArrayList<>(seen.values());
        scored.sort(Comparator.comparingInt(c -> -scoreChunk(c.getChunkText(), keywords)));

        return scored.stream().limit(MAX_CHUNKS_FOR_AI).toList();
    }

    private int scoreChunk(String chunkText, List<String> keywords) {
        int score = 0;
        String lower = chunkText.toLowerCase();
        for (String keyword : keywords) {
            if (lower.contains(keyword)) {
                score++;
            }
        }
        return score;
    }

    private List<String> extractKeywords(String question) {
        return Arrays.stream(question.toLowerCase().split("[^a-z0-9]+"))
                .filter(token -> token.length() > 2)
                .distinct()
                .limit(6)
                .toList();
    }

    private TeacherDocument getDocumentForTeacher(Long documentId) {
        TeacherProfile teacherProfile = getCurrentTeacherProfile();
        return teacherDocumentRepository.findByIdAndTeacherId(documentId, teacherProfile.getId())
                .orElseThrow(() -> new NotFoundException("Document not found"));
    }

    private TeacherProfile getCurrentTeacherProfile() {
        Long userId = SecurityUtils.getCurrentUser().getUser().getId();
        return teacherProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File exceeds max size of 20MB");
        }
    }
}

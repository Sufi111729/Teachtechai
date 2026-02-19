package com.sufi.approvalhub.controller;

import com.sufi.approvalhub.dto.teacher.document.*;
import com.sufi.approvalhub.service.document.TeacherDocumentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/documents")
public class TeacherDocumentController {
    private final TeacherDocumentService documentService;

    public TeacherDocumentController(TeacherDocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<TeacherDocumentUploadResponse> upload(@RequestPart("file") MultipartFile file,
                                                                @RequestParam(value = "title", required = false) String title) {
        return ResponseEntity.ok(documentService.uploadDocument(file, title));
    }

    @PostMapping("/notes")
    public ResponseEntity<TeacherDocumentUploadResponse> createNote(@RequestBody TeacherDocumentNoteRequest request) {
        return ResponseEntity.ok(documentService.createNote(request.getTitle(), request.getContent()));
    }

    @GetMapping
    public ResponseEntity<List<TeacherDocumentListDto>> list() {
        return ResponseEntity.ok(documentService.listDocuments());
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<TeacherDocumentDetailDto> detail(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getDocument(documentId));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{documentId}/ask")
    public ResponseEntity<TeacherDocumentAskResponse> ask(@PathVariable Long documentId,
                                                          @Valid @RequestBody TeacherDocumentAskRequest request) {
        return ResponseEntity.ok(documentService.askQuestion(documentId, request.getQuestion()));
    }

    @GetMapping("/ai/history")
    public ResponseEntity<List<TeacherAiQueryDto>> aiHistory() {
        return ResponseEntity.ok(documentService.getRecentAiQueries());
    }
}

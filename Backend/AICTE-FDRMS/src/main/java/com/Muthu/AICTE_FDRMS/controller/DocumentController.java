package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.model.DocumentRecord;
import com.Muthu.AICTE_FDRMS.model.DocumentStatus;
import com.Muthu.AICTE_FDRMS.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<List<DocumentRecord>> getDocuments(
            @RequestParam(required = false) String fdrId,
            @RequestParam(required = false) String institutionId,
            @RequestParam(required = false) String caseId) {
        return ResponseEntity.ok(documentService.getDocuments(fdrId, institutionId, caseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentRecord> getDocumentById(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DocumentRecord> addDocument(
            @RequestBody DocumentRecord doc,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        return ResponseEntity.ok(documentService.addDocument(doc, userEmail, userRole));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DocumentRecord> updateDocumentStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        String statusStr = (String) body.get("status");
        DocumentStatus status = statusStr != null ? DocumentStatus.valueOf(statusStr) : DocumentStatus.PENDING_REVIEW;
        @SuppressWarnings("unchecked")
        List<String> flags = (List<String>) body.get("flags");
        String notes = (String) body.get("notes");

        return documentService.updateDocumentStatus(id, status, flags, notes, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

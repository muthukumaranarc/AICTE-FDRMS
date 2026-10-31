package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.DocumentRecord;
import com.Muthu.AICTE_FDRMS.model.DocumentStatus;
import com.Muthu.AICTE_FDRMS.model.FdrInstrument;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DataStore dataStore;

    public DocumentService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<DocumentRecord> getDocuments(String fdrId, String institutionId, String caseId) {
        return dataStore.documents.values().stream()
                .filter(d -> {
                    if (fdrId != null && !fdrId.isBlank() && !fdrId.equals(d.getFdrId())) return false;
                    if (institutionId != null && !institutionId.isBlank() && !institutionId.equals(d.getInstitutionId())) return false;
                    if (caseId != null && !caseId.isBlank() && !caseId.equals(d.getCaseId())) return false;
                    return true;
                })
                .sorted(Comparator.comparing(DocumentRecord::getUploadedDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public Optional<DocumentRecord> getDocumentById(String id) {
        return Optional.ofNullable(dataStore.documents.get(id));
    }

    public DocumentRecord addDocument(DocumentRecord doc, String userEmail, String userRole) {
        String id = "DOC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        doc.setId(id);
        doc.setUploadedDate(dataStore.today());
        doc.setUploadedBy(userEmail);
        if (doc.getStatus() == null) doc.setStatus(DocumentStatus.PENDING_REVIEW);
        if (doc.getVersion() == null) doc.setVersion(1);

        dataStore.saveDocument(doc);

        // Update FDR flag if missing documents was marked
        if (doc.getFdrId() != null && dataStore.fdrInstruments.containsKey(doc.getFdrId())) {
            FdrInstrument f = dataStore.fdrInstruments.get(doc.getFdrId());
            // Check if there are still any pending flags
            f.setUpdatedAt(dataStore.now());
            dataStore.saveFdr(f);
        }

        dataStore.addAuditEntry(
                "DOCUMENT_UPLOAD", "DOCUMENT", id, userEmail, userRole,
                "Uploaded document: '" + doc.getTitle() + "' (Type: " + doc.getDocumentType() + ") for FDR: " + doc.getFdrId(),
                null, doc.getTitle()
        );

        return doc;
    }

    public Optional<DocumentRecord> updateDocumentStatus(String id, DocumentStatus status, List<String> flags,
                                                         String notes, String userEmail, String userRole) {
        DocumentRecord doc = dataStore.documents.get(id);
        if (doc == null) return Optional.empty();

        String prev = doc.getStatus().toString();
        doc.setStatus(status);
        if (flags != null) doc.setScrutinyFlags(flags);
        if (notes != null) doc.setNotes(notes);

        dataStore.saveDocument(doc);

        dataStore.addAuditEntry(
                "STATUS_CHANGE", "DOCUMENT", id, userEmail, userRole,
                "Updated scrutiny status of document '" + doc.getTitle() + "' to " + status + (flags != null ? " Flags: " + flags : ""),
                prev, status.toString()
        );

        return Optional.of(doc);
    }
}

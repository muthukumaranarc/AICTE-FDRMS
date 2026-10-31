package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "documents")
public class DocumentRecord {
    @Id
    private String id;

    @Indexed
    private String fdrId;

    @Indexed
    private String institutionId;

    @Indexed
    private String caseId;

    private DocumentType documentType;
    private String title;
    private String fileName;
    private String fileSize;
    private String fileContentType;
    private String fileContent; // Simulated content / base64 / text excerpt
    private String receivedDate;
    private String uploadedDate;
    private String uploadedBy;
    private String sourceReference;
    private Integer version = 1;
    private DocumentStatus status = DocumentStatus.PENDING_REVIEW;
    private List<String> scrutinyFlags = new ArrayList<>(); // MISSING, UNREADABLE, INCOMPLETE, EXPIRED, QUESTIONABLE
    private String notes;

    public DocumentRecord() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFdrId() { return fdrId; }
    public void setFdrId(String fdrId) { this.fdrId = fdrId; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public String getFileContentType() { return fileContentType; }
    public void setFileContentType(String fileContentType) { this.fileContentType = fileContentType; }

    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }

    public String getReceivedDate() { return receivedDate; }
    public void setReceivedDate(String receivedDate) { this.receivedDate = receivedDate; }

    public String getUploadedDate() { return uploadedDate; }
    public void setUploadedDate(String uploadedDate) { this.uploadedDate = uploadedDate; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getSourceReference() { return sourceReference; }
    public void setSourceReference(String sourceReference) { this.sourceReference = sourceReference; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public DocumentStatus getStatus() { return status; }
    public void setStatus(DocumentStatus status) { this.status = status; }

    public List<String> getScrutinyFlags() { return scrutinyFlags; }
    public void setScrutinyFlags(List<String> scrutinyFlags) { this.scrutinyFlags = scrutinyFlags; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

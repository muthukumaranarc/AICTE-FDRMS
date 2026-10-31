package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "scrutiny_observations")
public class ScrutinyObservation {
    @Id
    private String id;

    @Indexed
    private String fdrId;

    @Indexed
    private String institutionId;

    private String category; // AMOUNT_MISMATCH, DATE_MISMATCH, LIEN_ENDORSEMENT_MISSING, BANK_UNAUTHORIZED, TITLE_DISCREPANCY, EXPIRED_DOCUMENT, GENERAL_INQUIRY
    private ScrutinySeverity severity;
    private String observation;
    private Boolean followUpRequired = false;
    private String actionRequired;
    private String recordedBy;
    private String recordedAt;
    private Boolean resolved = false;
    private String resolvedBy;
    private String resolvedAt;
    private String resolutionNotes;

    public ScrutinyObservation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFdrId() { return fdrId; }
    public void setFdrId(String fdrId) { this.fdrId = fdrId; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public ScrutinySeverity getSeverity() { return severity; }
    public void setSeverity(ScrutinySeverity severity) { this.severity = severity; }

    public String getObservation() { return observation; }
    public void setObservation(String observation) { this.observation = observation; }

    public Boolean getFollowUpRequired() { return followUpRequired; }
    public void setFollowUpRequired(Boolean followUpRequired) { this.followUpRequired = followUpRequired; }

    public String getActionRequired() { return actionRequired; }
    public void setActionRequired(String actionRequired) { this.actionRequired = actionRequired; }

    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }

    public String getRecordedAt() { return recordedAt; }
    public void setRecordedAt(String recordedAt) { this.recordedAt = recordedAt; }

    public Boolean getResolved() { return resolved; }
    public void setResolved(Boolean resolved) { this.resolved = resolved; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}

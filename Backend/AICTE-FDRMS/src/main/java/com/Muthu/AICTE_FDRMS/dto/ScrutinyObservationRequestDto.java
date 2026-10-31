package com.Muthu.AICTE_FDRMS.dto;

import com.Muthu.AICTE_FDRMS.model.ScrutinySeverity;

public class ScrutinyObservationRequestDto {
    private String fdrId;
    private String category;
    private ScrutinySeverity severity;
    private String observation;
    private Boolean followUpRequired = false;
    private String actionRequired;
    private String recordedBy;

    public ScrutinyObservationRequestDto() {}

    public String getFdrId() { return fdrId; }
    public void setFdrId(String fdrId) { this.fdrId = fdrId; }

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
}

package com.Muthu.AICTE_FDRMS.dto;

public class ReleaseCaseDecisionDto {
    private String caseId;
    private String decision; // APPROVED, REJECTED, REFERRED_BACK
    private String sanctionOrderNumber;
    private String authorityRemarks;
    private String authorizedBy;
    private String decisionDate;

    public ReleaseCaseDecisionDto() {}

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getSanctionOrderNumber() { return sanctionOrderNumber; }
    public void setSanctionOrderNumber(String sanctionOrderNumber) { this.sanctionOrderNumber = sanctionOrderNumber; }

    public String getAuthorityRemarks() { return authorityRemarks; }
    public void setAuthorityRemarks(String authorityRemarks) { this.authorityRemarks = authorityRemarks; }

    public String getAuthorizedBy() { return authorizedBy; }
    public void setAuthorizedBy(String authorizedBy) { this.authorizedBy = authorizedBy; }

    public String getDecisionDate() { return decisionDate; }
    public void setDecisionDate(String decisionDate) { this.decisionDate = decisionDate; }
}

package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "release_cases")
public class ReleaseRefundCase {
    @Id
    private String id;

    @Indexed
    private String institutionId;

    private String institutionName;
    private String institutionAicteId;

    @Indexed
    private String fdrId;

    private String fdrNumber;
    private Double amount;
    private String requestReason; // TENURE_COMPLETION_8_YEARS, COURSE_CLOSURE, INSTITUTION_CLOSURE, SUBSTITUTION_WITH_BG, EXCESS_DEPOSIT_REFUND
    private String requestDate;
    private String institutionLetterRef;

    @Indexed
    private CaseStatus caseStatus = CaseStatus.AWAITING_SCRUTINY;

    private String assignedReviewer;
    private Map<String, Boolean> complianceChecklist = new HashMap<>();
    private String scrutinyRecommendation; // RECOMMENDED_FOR_RELEASE, RECOMMENDED_FOR_REJECTION, MORE_INFO_NEEDED
    private String reviewerNotes;
    private String reviewedBy;
    private String reviewedAt;
    private String authorityDecision; // APPROVED, REJECTED, REFERRED_BACK, PENDING
    private String decisionDate;
    private String sanctionOrderNumber;
    private String authorityRemarks;
    private String authorizedBy;
    private String releaseCompletionDate;
    private String dischargeCertificateNo;
    private String dispatchReference;
    private String completionRemarks;
    private String completedBy;
    private String createdAt;
    private String updatedAt;

    public ReleaseRefundCase() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getInstitutionAicteId() { return institutionAicteId; }
    public void setInstitutionAicteId(String institutionAicteId) { this.institutionAicteId = institutionAicteId; }

    public String getFdrId() { return fdrId; }
    public void setFdrId(String fdrId) { this.fdrId = fdrId; }

    public String getFdrNumber() { return fdrNumber; }
    public void setFdrNumber(String fdrNumber) { this.fdrNumber = fdrNumber; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getRequestReason() { return requestReason; }
    public void setRequestReason(String requestReason) { this.requestReason = requestReason; }

    public String getRequestDate() { return requestDate; }
    public void setRequestDate(String requestDate) { this.requestDate = requestDate; }

    public String getInstitutionLetterRef() { return institutionLetterRef; }
    public void setInstitutionLetterRef(String institutionLetterRef) { this.institutionLetterRef = institutionLetterRef; }

    public CaseStatus getCaseStatus() { return caseStatus; }
    public void setCaseStatus(CaseStatus caseStatus) { this.caseStatus = caseStatus; }

    public String getAssignedReviewer() { return assignedReviewer; }
    public void setAssignedReviewer(String assignedReviewer) { this.assignedReviewer = assignedReviewer; }

    public Map<String, Boolean> getComplianceChecklist() { return complianceChecklist; }
    public void setComplianceChecklist(Map<String, Boolean> complianceChecklist) { this.complianceChecklist = complianceChecklist; }

    public String getScrutinyRecommendation() { return scrutinyRecommendation; }
    public void setScrutinyRecommendation(String scrutinyRecommendation) { this.scrutinyRecommendation = scrutinyRecommendation; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(String reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getAuthorityDecision() { return authorityDecision; }
    public void setAuthorityDecision(String authorityDecision) { this.authorityDecision = authorityDecision; }

    public String getDecisionDate() { return decisionDate; }
    public void setDecisionDate(String decisionDate) { this.decisionDate = decisionDate; }

    public String getSanctionOrderNumber() { return sanctionOrderNumber; }
    public void setSanctionOrderNumber(String sanctionOrderNumber) { this.sanctionOrderNumber = sanctionOrderNumber; }

    public String getAuthorityRemarks() { return authorityRemarks; }
    public void setAuthorityRemarks(String authorityRemarks) { this.authorityRemarks = authorityRemarks; }

    public String getAuthorizedBy() { return authorizedBy; }
    public void setAuthorizedBy(String authorizedBy) { this.authorizedBy = authorizedBy; }

    public String getReleaseCompletionDate() { return releaseCompletionDate; }
    public void setReleaseCompletionDate(String releaseCompletionDate) { this.releaseCompletionDate = releaseCompletionDate; }

    public String getDischargeCertificateNo() { return dischargeCertificateNo; }
    public void setDischargeCertificateNo(String dischargeCertificateNo) { this.dischargeCertificateNo = dischargeCertificateNo; }

    public String getDispatchReference() { return dispatchReference; }
    public void setDispatchReference(String dispatchReference) { this.dispatchReference = dispatchReference; }

    public String getCompletionRemarks() { return completionRemarks; }
    public void setCompletionRemarks(String completionRemarks) { this.completionRemarks = completionRemarks; }

    public String getCompletedBy() { return completedBy; }
    public void setCompletedBy(String completedBy) { this.completedBy = completedBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}

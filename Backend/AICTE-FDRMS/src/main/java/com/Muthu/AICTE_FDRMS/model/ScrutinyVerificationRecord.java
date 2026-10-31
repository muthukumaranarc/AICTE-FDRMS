package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "verifications")
public class ScrutinyVerificationRecord {
    @Id
    private String id;

    @Indexed
    private String fdrId;

    @Indexed
    private String institutionId;

    private String verificationMethod; // OFFICIAL_BANK_LETTER, OFFICIAL_BANK_EMAIL, BANK_PORTAL_CONFIRMATION, PHYSICAL_INSPECTION, SFMS_BANK_ADVICE
    private String verificationSource;
    private String referenceNumber;
    private String verificationDate;
    private String result; // VERIFIED, UNABLE_TO_VERIFY, DISCREPANCY_FOUND, PENDING_CONFIRMATION
    private String verifiedBy;
    private String supportingDocumentId;
    private Double confirmedAmount;
    private String confirmedMaturityDate;
    private Boolean confirmedLienStatus;
    private String discrepancyDetails;
    private String remarks;
    private String createdAt;

    public ScrutinyVerificationRecord() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFdrId() { return fdrId; }
    public void setFdrId(String fdrId) { this.fdrId = fdrId; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getVerificationMethod() { return verificationMethod; }
    public void setVerificationMethod(String verificationMethod) { this.verificationMethod = verificationMethod; }

    public String getVerificationSource() { return verificationSource; }
    public void setVerificationSource(String verificationSource) { this.verificationSource = verificationSource; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getVerificationDate() { return verificationDate; }
    public void setVerificationDate(String verificationDate) { this.verificationDate = verificationDate; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public String getSupportingDocumentId() { return supportingDocumentId; }
    public void setSupportingDocumentId(String supportingDocumentId) { this.supportingDocumentId = supportingDocumentId; }

    public Double getConfirmedAmount() { return confirmedAmount; }
    public void setConfirmedAmount(Double confirmedAmount) { this.confirmedAmount = confirmedAmount; }

    public String getConfirmedMaturityDate() { return confirmedMaturityDate; }
    public void setConfirmedMaturityDate(String confirmedMaturityDate) { this.confirmedMaturityDate = confirmedMaturityDate; }

    public Boolean getConfirmedLienStatus() { return confirmedLienStatus; }
    public void setConfirmedLienStatus(Boolean confirmedLienStatus) { this.confirmedLienStatus = confirmedLienStatus; }

    public String getDiscrepancyDetails() { return discrepancyDetails; }
    public void setDiscrepancyDetails(String discrepancyDetails) { this.discrepancyDetails = discrepancyDetails; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

package com.Muthu.AICTE_FDRMS.dto;

public class VerificationRequestDto {
    private String fdrId;
    private String verificationMethod;
    private String verificationSource;
    private String referenceNumber;
    private String verificationDate;
    private String result; // VERIFIED, UNABLE_TO_VERIFY, DISCREPANCY_FOUND, PENDING_CONFIRMATION
    private Double confirmedAmount;
    private String confirmedMaturityDate;
    private Boolean confirmedLienStatus;
    private String discrepancyDetails;
    private String remarks;
    private String verifiedBy;
    private String supportingDocumentTitle;

    public VerificationRequestDto() {}

    public String getFdrId() { return fdrId; }
    public void setFdrId(String fdrId) { this.fdrId = fdrId; }

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

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public String getSupportingDocumentTitle() { return supportingDocumentTitle; }
    public void setSupportingDocumentTitle(String supportingDocumentTitle) { this.supportingDocumentTitle = supportingDocumentTitle; }
}

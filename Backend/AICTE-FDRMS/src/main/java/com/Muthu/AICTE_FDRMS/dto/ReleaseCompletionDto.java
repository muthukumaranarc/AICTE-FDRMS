package com.Muthu.AICTE_FDRMS.dto;

public class ReleaseCompletionDto {
    private String caseId;
    private String dischargeCertificateNo;
    private String dispatchReference;
    private String completionRemarks;
    private String releaseCompletionDate;
    private String completedBy;

    public ReleaseCompletionDto() {}

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getDischargeCertificateNo() { return dischargeCertificateNo; }
    public void setDischargeCertificateNo(String dischargeCertificateNo) { this.dischargeCertificateNo = dischargeCertificateNo; }

    public String getDispatchReference() { return dispatchReference; }
    public void setDispatchReference(String dispatchReference) { this.dispatchReference = dispatchReference; }

    public String getCompletionRemarks() { return completionRemarks; }
    public void setCompletionRemarks(String completionRemarks) { this.completionRemarks = completionRemarks; }

    public String getReleaseCompletionDate() { return releaseCompletionDate; }
    public void setReleaseCompletionDate(String releaseCompletionDate) { this.releaseCompletionDate = releaseCompletionDate; }

    public String getCompletedBy() { return completedBy; }
    public void setCompletedBy(String completedBy) { this.completedBy = completedBy; }
}

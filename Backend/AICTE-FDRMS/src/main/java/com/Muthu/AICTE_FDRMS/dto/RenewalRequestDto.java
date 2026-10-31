package com.Muthu.AICTE_FDRMS.dto;

public class RenewalRequestDto {
    private String previousFdrId;
    private String newFdrNumber;
    private String newBankName;
    private String newBranchName;
    private String newBranchIfsc;
    private Double newAmount;
    private String newIssueDate;
    private String newMaturityDate;
    private Integer newTenureMonths;
    private Double newInterestRate;
    private Double newMaturityAmount;
    private Boolean jointLienMarked = true;
    private String jointHolderName;
    private String renewalDocumentTitle;
    private String renewalDocumentSource;
    private String remarks;
    private String performedBy;

    public RenewalRequestDto() {}

    public String getPreviousFdrId() { return previousFdrId; }
    public void setPreviousFdrId(String previousFdrId) { this.previousFdrId = previousFdrId; }

    public String getNewFdrNumber() { return newFdrNumber; }
    public void setNewFdrNumber(String newFdrNumber) { this.newFdrNumber = newFdrNumber; }

    public String getNewBankName() { return newBankName; }
    public void setNewBankName(String newBankName) { this.newBankName = newBankName; }

    public String getNewBranchName() { return newBranchName; }
    public void setNewBranchName(String newBranchName) { this.newBranchName = newBranchName; }

    public String getNewBranchIfsc() { return newBranchIfsc; }
    public void setNewBranchIfsc(String newBranchIfsc) { this.newBranchIfsc = newBranchIfsc; }

    public Double getNewAmount() { return newAmount; }
    public void setNewAmount(Double newAmount) { this.newAmount = newAmount; }

    public String getNewIssueDate() { return newIssueDate; }
    public void setNewIssueDate(String newIssueDate) { this.newIssueDate = newIssueDate; }

    public String getNewMaturityDate() { return newMaturityDate; }
    public void setNewMaturityDate(String newMaturityDate) { this.newMaturityDate = newMaturityDate; }

    public Integer getNewTenureMonths() { return newTenureMonths; }
    public void setNewTenureMonths(Integer newTenureMonths) { this.newTenureMonths = newTenureMonths; }

    public Double getNewInterestRate() { return newInterestRate; }
    public void setNewInterestRate(Double newInterestRate) { this.newInterestRate = newInterestRate; }

    public Double getNewMaturityAmount() { return newMaturityAmount; }
    public void setNewMaturityAmount(Double newMaturityAmount) { this.newMaturityAmount = newMaturityAmount; }

    public Boolean getJointLienMarked() { return jointLienMarked; }
    public void setJointLienMarked(Boolean jointLienMarked) { this.jointLienMarked = jointLienMarked; }

    public String getJointHolderName() { return jointHolderName; }
    public void setJointHolderName(String jointHolderName) { this.jointHolderName = jointHolderName; }

    public String getRenewalDocumentTitle() { return renewalDocumentTitle; }
    public void setRenewalDocumentTitle(String renewalDocumentTitle) { this.renewalDocumentTitle = renewalDocumentTitle; }

    public String getRenewalDocumentSource() { return renewalDocumentSource; }
    public void setRenewalDocumentSource(String renewalDocumentSource) { this.renewalDocumentSource = renewalDocumentSource; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}

package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "fdr_instruments")
public class FdrInstrument {
    @Id
    private String id;

    @Indexed(unique = true)
    private String fdrNumber;

    @Indexed
    private String institutionId;

    private String institutionName;
    private String institutionAicteId;
    private InstrumentType instrumentType;
    private String bankName;
    private String branchName;
    private String branchIfsc;
    private Double amount;
    private String currency = "INR";
    private String issueDate;
    private String maturityDate;
    private Integer tenureMonths;
    private Double interestRate;
    private String interestType;
    private Double maturityAmount;
    private Boolean jointLienMarked;
    private String jointHolderName;
    private String instrumentEvent; // NEW_DEPOSIT, RENEWAL, REPLACEMENT
    private String complianceReference;

    @Indexed
    private InstrumentStatus instrumentStatus;

    @Indexed
    private VerificationStatus verificationStatus;

    private String assignedReviewerId;
    private String assignedReviewerName;
    private Priority priority;
    private String previousFdrId;
    private String nextFdrId;
    private String remarks;
    private Boolean flagMissingDocuments = false;
    private Boolean flagDiscrepancy = false;
    private String createdAt;
    private String updatedAt;

    public FdrInstrument() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFdrNumber() { return fdrNumber; }
    public void setFdrNumber(String fdrNumber) { this.fdrNumber = fdrNumber; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getInstitutionAicteId() { return institutionAicteId; }
    public void setInstitutionAicteId(String institutionAicteId) { this.institutionAicteId = institutionAicteId; }

    public InstrumentType getInstrumentType() { return instrumentType; }
    public void setInstrumentType(InstrumentType instrumentType) { this.instrumentType = instrumentType; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getBranchIfsc() { return branchIfsc; }
    public void setBranchIfsc(String branchIfsc) { this.branchIfsc = branchIfsc; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getIssueDate() { return issueDate; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }

    public String getMaturityDate() { return maturityDate; }
    public void setMaturityDate(String maturityDate) { this.maturityDate = maturityDate; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }

    public Double getInterestRate() { return interestRate; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }

    public String getInterestType() { return interestType; }
    public void setInterestType(String interestType) { this.interestType = interestType; }

    public Double getMaturityAmount() { return maturityAmount; }
    public void setMaturityAmount(Double maturityAmount) { this.maturityAmount = maturityAmount; }

    public Boolean getJointLienMarked() { return jointLienMarked; }
    public void setJointLienMarked(Boolean jointLienMarked) { this.jointLienMarked = jointLienMarked; }

    public String getJointHolderName() { return jointHolderName; }
    public void setJointHolderName(String jointHolderName) { this.jointHolderName = jointHolderName; }

    public String getInstrumentEvent() { return instrumentEvent; }
    public void setInstrumentEvent(String instrumentEvent) { this.instrumentEvent = instrumentEvent; }

    public String getComplianceReference() { return complianceReference; }
    public void setComplianceReference(String complianceReference) { this.complianceReference = complianceReference; }

    public InstrumentStatus getInstrumentStatus() { return instrumentStatus; }
    public void setInstrumentStatus(InstrumentStatus instrumentStatus) { this.instrumentStatus = instrumentStatus; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getAssignedReviewerId() { return assignedReviewerId; }
    public void setAssignedReviewerId(String assignedReviewerId) { this.assignedReviewerId = assignedReviewerId; }

    public String getAssignedReviewerName() { return assignedReviewerName; }
    public void setAssignedReviewerName(String assignedReviewerName) { this.assignedReviewerName = assignedReviewerName; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getPreviousFdrId() { return previousFdrId; }
    public void setPreviousFdrId(String previousFdrId) { this.previousFdrId = previousFdrId; }

    public String getNextFdrId() { return nextFdrId; }
    public void setNextFdrId(String nextFdrId) { this.nextFdrId = nextFdrId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Boolean getFlagMissingDocuments() { return flagMissingDocuments; }
    public void setFlagMissingDocuments(Boolean flagMissingDocuments) { this.flagMissingDocuments = flagMissingDocuments; }

    public Boolean getFlagDiscrepancy() { return flagDiscrepancy; }
    public void setFlagDiscrepancy(Boolean flagDiscrepancy) { this.flagDiscrepancy = flagDiscrepancy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}

package com.Muthu.AICTE_FDRMS.dto;

import com.Muthu.AICTE_FDRMS.model.AuditTrailEntry;
import com.Muthu.AICTE_FDRMS.model.FdrInstrument;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalInstruments;
    private double totalDepositAmount;
    
    private long activeCount;
    private double activeAmount;
    
    private long expiringSoonCount;
    private double expiringSoonAmount;
    
    private long maturedCount;
    private double maturedAmount;
    
    private long overdueCount;
    private double overdueAmount;
    
    private long pendingVerificationCount;
    private double pendingVerificationAmount;
    
    private long renewalPendingCount;
    private double renewalPendingAmount;
    
    private long releasePendingCount;
    private double releasePendingAmount;
    
    private long releasedCount;
    private double releasedAmount;
    
    private long closedCount;
    private double closedAmount;
    
    private long urgentCasesCount;
    private long missingDocumentsCount;
    private long unresolvedDiscrepanciesCount;
    
    private List<AuditTrailEntry> recentActivities = new ArrayList<>();
    private List<FdrInstrument> urgentCases = new ArrayList<>();
    private Map<String, Double> bankConcentration = new HashMap<>();

    public DashboardStatsDto() {}

    public long getTotalInstruments() { return totalInstruments; }
    public void setTotalInstruments(long totalInstruments) { this.totalInstruments = totalInstruments; }

    public double getTotalDepositAmount() { return totalDepositAmount; }
    public void setTotalDepositAmount(double totalDepositAmount) { this.totalDepositAmount = totalDepositAmount; }

    public long getActiveCount() { return activeCount; }
    public void setActiveCount(long activeCount) { this.activeCount = activeCount; }

    public double getActiveAmount() { return activeAmount; }
    public void setActiveAmount(double activeAmount) { this.activeAmount = activeAmount; }

    public long getExpiringSoonCount() { return expiringSoonCount; }
    public void setExpiringSoonCount(long expiringSoonCount) { this.expiringSoonCount = expiringSoonCount; }

    public double getExpiringSoonAmount() { return expiringSoonAmount; }
    public void setExpiringSoonAmount(double expiringSoonAmount) { this.expiringSoonAmount = expiringSoonAmount; }

    public long getMaturedCount() { return maturedCount; }
    public void setMaturedCount(long maturedCount) { this.maturedCount = maturedCount; }

    public double getMaturedAmount() { return maturedAmount; }
    public void setMaturedAmount(double maturedAmount) { this.maturedAmount = maturedAmount; }

    public long getOverdueCount() { return overdueCount; }
    public void setOverdueCount(long overdueCount) { this.overdueCount = overdueCount; }

    public double getOverdueAmount() { return overdueAmount; }
    public void setOverdueAmount(double overdueAmount) { this.overdueAmount = overdueAmount; }

    public long getPendingVerificationCount() { return pendingVerificationCount; }
    public void setPendingVerificationCount(long pendingVerificationCount) { this.pendingVerificationCount = pendingVerificationCount; }

    public double getPendingVerificationAmount() { return pendingVerificationAmount; }
    public void setPendingVerificationAmount(double pendingVerificationAmount) { this.pendingVerificationAmount = pendingVerificationAmount; }

    public long getRenewalPendingCount() { return renewalPendingCount; }
    public void setRenewalPendingCount(long renewalPendingCount) { this.renewalPendingCount = renewalPendingCount; }

    public double getRenewalPendingAmount() { return renewalPendingAmount; }
    public void setRenewalPendingAmount(double renewalPendingAmount) { this.renewalPendingAmount = renewalPendingAmount; }

    public long getReleasePendingCount() { return releasePendingCount; }
    public void setReleasePendingCount(long releasePendingCount) { this.releasePendingCount = releasePendingCount; }

    public double getReleasePendingAmount() { return releasePendingAmount; }
    public void setReleasePendingAmount(double releasePendingAmount) { this.releasePendingAmount = releasePendingAmount; }

    public long getReleasedCount() { return releasedCount; }
    public void setReleasedCount(long releasedCount) { this.releasedCount = releasedCount; }

    public double getReleasedAmount() { return releasedAmount; }
    public void setReleasedAmount(double releasedAmount) { this.releasedAmount = releasedAmount; }

    public long getClosedCount() { return closedCount; }
    public void setClosedCount(long closedCount) { this.closedCount = closedCount; }

    public double getClosedAmount() { return closedAmount; }
    public void setClosedAmount(double closedAmount) { this.closedAmount = closedAmount; }

    public long getUrgentCasesCount() { return urgentCasesCount; }
    public void setUrgentCasesCount(long urgentCasesCount) { this.urgentCasesCount = urgentCasesCount; }

    public long getMissingDocumentsCount() { return missingDocumentsCount; }
    public void setMissingDocumentsCount(long missingDocumentsCount) { this.missingDocumentsCount = missingDocumentsCount; }

    public long getUnresolvedDiscrepanciesCount() { return unresolvedDiscrepanciesCount; }
    public void setUnresolvedDiscrepanciesCount(long unresolvedDiscrepanciesCount) { this.unresolvedDiscrepanciesCount = unresolvedDiscrepanciesCount; }

    public List<AuditTrailEntry> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<AuditTrailEntry> recentActivities) { this.recentActivities = recentActivities; }

    public List<FdrInstrument> getUrgentCases() { return urgentCases; }
    public void setUrgentCases(List<FdrInstrument> urgentCases) { this.urgentCases = urgentCases; }

    public Map<String, Double> getBankConcentration() { return bankConcentration; }
    public void setBankConcentration(Map<String, Double> bankConcentration) { this.bankConcentration = bankConcentration; }
}

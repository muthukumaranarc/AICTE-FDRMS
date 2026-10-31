package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.dto.DashboardStatsDto;
import com.Muthu.AICTE_FDRMS.dto.RenewalRequestDto;
import com.Muthu.AICTE_FDRMS.model.*;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FdrService {

    private final DataStore dataStore;

    public FdrService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public DashboardStatsDto getDashboardStats() {
        dataStore.recalculateAllStatuses();
        DashboardStatsDto dto = new DashboardStatsDto();

        Collection<FdrInstrument> all = dataStore.fdrInstruments.values();
        dto.setTotalInstruments(all.size());
        dto.setTotalDepositAmount(all.stream().mapToDouble(FdrInstrument::getAmount).sum());

        long activeCount = 0; double activeAmt = 0;
        long expiringCount = 0; double expiringAmt = 0;
        long maturedCount = 0; double maturedAmt = 0;
        long overdueCount = 0; double overdueAmt = 0;
        long pendingVerifCount = 0; double pendingVerifAmt = 0;
        long renewalPendingCount = 0; double renewalPendingAmt = 0;
        long releasePendingCount = 0; double releasePendingAmt = 0;
        long releasedCount = 0; double releasedAmt = 0;
        long closedCount = 0; double closedAmt = 0;
        long missingDocs = 0;
        long discrepancies = 0;
        long urgentCount = 0;

        Map<String, Double> bankSums = new HashMap<>();

        for (FdrInstrument f : all) {
            InstrumentStatus s = f.getInstrumentStatus();
            double amt = f.getAmount() != null ? f.getAmount() : 0.0;

            if (s == InstrumentStatus.ACTIVE) { activeCount++; activeAmt += amt; }
            else if (s == InstrumentStatus.EXPIRING_SOON) { expiringCount++; expiringAmt += amt; }
            else if (s == InstrumentStatus.MATURED) { maturedCount++; maturedAmt += amt; }
            else if (s == InstrumentStatus.OVERDUE) { overdueCount++; overdueAmt += amt; }
            else if (s == InstrumentStatus.RENEWAL_PENDING) { renewalPendingCount++; renewalPendingAmt += amt; }
            else if (s == InstrumentStatus.RELEASE_PENDING) { releasePendingCount++; releasePendingAmt += amt; }
            else if (s == InstrumentStatus.RELEASED) { releasedCount++; releasedAmt += amt; }
            else if (s == InstrumentStatus.CLOSED) { closedCount++; closedAmt += amt; }

            if (f.getVerificationStatus() == VerificationStatus.PENDING_SCRUTINY ||
                f.getVerificationStatus() == VerificationStatus.UNDER_REVIEW) {
                pendingVerifCount++;
                pendingVerifAmt += amt;
            }

            if (Boolean.TRUE.equals(f.getFlagMissingDocuments())) missingDocs++;
            if (Boolean.TRUE.equals(f.getFlagDiscrepancy()) || f.getVerificationStatus() == VerificationStatus.DISCREPANCY_FOUND) discrepancies++;
            if (f.getPriority() == Priority.URGENT) urgentCount++;

            if (f.getBankName() != null && !f.getBankName().isBlank()) {
                bankSums.put(f.getBankName(), bankSums.getOrDefault(f.getBankName(), 0.0) + amt);
            }
        }

        dto.setActiveCount(activeCount); dto.setActiveAmount(activeAmt);
        dto.setExpiringSoonCount(expiringCount); dto.setExpiringSoonAmount(expiringAmt);
        dto.setMaturedCount(maturedCount); dto.setMaturedAmount(maturedAmt);
        dto.setOverdueCount(overdueCount); dto.setOverdueAmount(overdueAmt);
        dto.setPendingVerificationCount(pendingVerifCount); dto.setPendingVerificationAmount(pendingVerifAmt);
        dto.setRenewalPendingCount(renewalPendingCount); dto.setRenewalPendingAmount(renewalPendingAmt);
        dto.setReleasePendingCount(releasePendingCount); dto.setReleasePendingAmount(releasePendingAmt);
        dto.setReleasedCount(releasedCount); dto.setReleasedAmount(releasedAmt);
        dto.setClosedCount(closedCount); dto.setClosedAmount(closedAmt);

        dto.setUrgentCasesCount(urgentCount);
        dto.setMissingDocumentsCount(missingDocs);
        dto.setUnresolvedDiscrepanciesCount(discrepancies);
        dto.setBankConcentration(bankSums);

        // Recent activities (first 10)
        dto.setRecentActivities(dataStore.auditTrail.stream().limit(10).collect(Collectors.toList()));

        // Urgent cases
        dto.setUrgentCases(all.stream()
                .filter(f -> f.getPriority() == Priority.URGENT || f.getInstrumentStatus() == InstrumentStatus.OVERDUE || f.getInstrumentStatus() == InstrumentStatus.EXPIRING_SOON)
                .sorted(Comparator.comparing(FdrInstrument::getMaturityDate, Comparator.nullsLast(String::compareTo)))
                .limit(8)
                .collect(Collectors.toList()));

        return dto;
    }

    public List<FdrInstrument> getAllFdrs(String query, String institutionId, String bank,
                                         InstrumentStatus status, VerificationStatus verifStatus,
                                         Double minAmount, Double maxAmount, String reviewer) {
        dataStore.recalculateAllStatuses();
        return dataStore.fdrInstruments.values().stream()
                .filter(f -> {
                    if (query != null && !query.isBlank()) {
                        String q = query.toLowerCase();
                        boolean match = (f.getFdrNumber() != null && f.getFdrNumber().toLowerCase().contains(q)) ||
                                        (f.getInstitutionName() != null && f.getInstitutionName().toLowerCase().contains(q)) ||
                                        (f.getBankName() != null && f.getBankName().toLowerCase().contains(q)) ||
                                        (f.getComplianceReference() != null && f.getComplianceReference().toLowerCase().contains(q));
                        if (!match) return false;
                    }
                    if (institutionId != null && !institutionId.isBlank() && !institutionId.equals(f.getInstitutionId())) return false;
                    if (bank != null && !bank.isBlank() && !bank.equalsIgnoreCase(f.getBankName())) return false;
                    if (status != null && f.getInstrumentStatus() != status) return false;
                    if (verifStatus != null && f.getVerificationStatus() != verifStatus) return false;
                    if (minAmount != null && (f.getAmount() == null || f.getAmount() < minAmount)) return false;
                    if (maxAmount != null && (f.getAmount() == null || f.getAmount() > maxAmount)) return false;
                    if (reviewer != null && !reviewer.isBlank() && !reviewer.equalsIgnoreCase(f.getAssignedReviewerId())) return false;
                    return true;
                })
                .sorted(Comparator.comparing(FdrInstrument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public Optional<FdrInstrument> getFdrById(String id) {
        dataStore.recalculateAllStatuses();
        return Optional.ofNullable(dataStore.fdrInstruments.get(id));
    }

    public List<FdrInstrument> checkDuplicates(String fdrNumber, String excludeId) {
        if (fdrNumber == null || fdrNumber.trim().isBlank()) return Collections.emptyList();
        String cleaned = fdrNumber.trim().replaceAll("[\\s-/]", "").toLowerCase();
        return dataStore.fdrInstruments.values().stream()
                .filter(f -> excludeId == null || !excludeId.equals(f.getId()))
                .filter(f -> {
                    if (f.getFdrNumber() == null) return false;
                    String existingCleaned = f.getFdrNumber().trim().replaceAll("[\\s-/]", "").toLowerCase();
                    return existingCleaned.equals(cleaned);
                })
                .collect(Collectors.toList());
    }

    public FdrInstrument createFdr(FdrInstrument fdr, String userEmail, String userRole) {
        String id = "FDR-" + Calendar.getInstance().get(Calendar.YEAR) + "-" + String.format("%03d", dataStore.fdrInstruments.size() + 1);
        fdr.setId(id);
        fdr.setCreatedAt(dataStore.now());
        fdr.setUpdatedAt(dataStore.now());

        if (fdr.getInstrumentStatus() == null) fdr.setInstrumentStatus(InstrumentStatus.ACTIVE);
        if (fdr.getVerificationStatus() == null) fdr.setVerificationStatus(VerificationStatus.PENDING_SCRUTINY);
        if (fdr.getPriority() == null) fdr.setPriority(Priority.MEDIUM);

        // Fetch institution name if provided
        if (fdr.getInstitutionId() != null && dataStore.institutions.containsKey(fdr.getInstitutionId())) {
            Institution inst = dataStore.institutions.get(fdr.getInstitutionId());
            fdr.setInstitutionName(inst.getName());
            fdr.setInstitutionAicteId(inst.getAictePermanentId());
        }

        dataStore.saveFdr(fdr);
        dataStore.addAuditEntry(
                "CREATE", "FDR", id, userEmail, userRole,
                "New FDR registered: " + fdr.getFdrNumber() + " for " + fdr.getInstitutionName() + " (Amount: ₹" + fdr.getAmount() + ")",
                null, fdr.getFdrNumber()
        );

        dataStore.recalculateAllStatuses();
        return fdr;
    }

    public Optional<FdrInstrument> updateFdr(String id, FdrInstrument updated, String userEmail, String userRole) {
        FdrInstrument existing = dataStore.fdrInstruments.get(id);
        if (existing == null) return Optional.empty();

        String beforeVal = "Status=" + existing.getInstrumentStatus() + ", Amt=" + existing.getAmount();

        existing.setFdrNumber(updated.getFdrNumber());
        existing.setBankName(updated.getBankName());
        existing.setBranchName(updated.getBranchName());
        existing.setBranchIfsc(updated.getBranchIfsc());
        existing.setAmount(updated.getAmount());
        existing.setIssueDate(updated.getIssueDate());
        existing.setMaturityDate(updated.getMaturityDate());
        existing.setTenureMonths(updated.getTenureMonths());
        existing.setInterestRate(updated.getInterestRate());
        existing.setInterestType(updated.getInterestType());
        existing.setMaturityAmount(updated.getMaturityAmount());
        existing.setJointLienMarked(updated.getJointLienMarked());
        existing.setJointHolderName(updated.getJointHolderName());
        existing.setComplianceReference(updated.getComplianceReference());
        existing.setRemarks(updated.getRemarks());
        existing.setPriority(updated.getPriority());
        existing.setFlagMissingDocuments(updated.getFlagMissingDocuments());
        existing.setFlagDiscrepancy(updated.getFlagDiscrepancy());
        if (updated.getInstrumentStatus() != null) existing.setInstrumentStatus(updated.getInstrumentStatus());
        if (updated.getVerificationStatus() != null) existing.setVerificationStatus(updated.getVerificationStatus());
        existing.setUpdatedAt(dataStore.now());

        dataStore.saveFdr(existing);

        String afterVal = "Status=" + existing.getInstrumentStatus() + ", Amt=" + existing.getAmount();

        dataStore.addAuditEntry(
                "UPDATE", "FDR", id, userEmail, userRole,
                "FDR instrument details updated for: " + existing.getFdrNumber(),
                beforeVal, afterVal
        );

        dataStore.recalculateAllStatuses();
        return Optional.of(existing);
    }

    public FdrInstrument recordRenewal(RenewalRequestDto req) {
        FdrInstrument oldFdr = dataStore.fdrInstruments.get(req.getPreviousFdrId());
        if (oldFdr == null) {
            throw new IllegalArgumentException("Previous FDR not found with ID: " + req.getPreviousFdrId());
        }

        // Create new renewed FDR instrument
        String newId = "FDR-" + Calendar.getInstance().get(Calendar.YEAR) + "-" + String.format("%03d", dataStore.fdrInstruments.size() + 1);
        FdrInstrument newFdr = new FdrInstrument();
        newFdr.setId(newId);
        newFdr.setFdrNumber(req.getNewFdrNumber());
        newFdr.setInstitutionId(oldFdr.getInstitutionId());
        newFdr.setInstitutionName(oldFdr.getInstitutionName());
        newFdr.setInstitutionAicteId(oldFdr.getInstitutionAicteId());
        newFdr.setInstrumentType(oldFdr.getInstrumentType());
        newFdr.setBankName(req.getNewBankName() != null ? req.getNewBankName() : oldFdr.getBankName());
        newFdr.setBranchName(req.getNewBranchName() != null ? req.getNewBranchName() : oldFdr.getBranchName());
        newFdr.setBranchIfsc(req.getNewBranchIfsc() != null ? req.getNewBranchIfsc() : oldFdr.getBranchIfsc());
        newFdr.setAmount(req.getNewAmount() != null ? req.getNewAmount() : oldFdr.getAmount());
        newFdr.setCurrency("INR");
        newFdr.setIssueDate(req.getNewIssueDate());
        newFdr.setMaturityDate(req.getNewMaturityDate());
        newFdr.setTenureMonths(req.getNewTenureMonths());
        newFdr.setInterestRate(req.getNewInterestRate());
        newFdr.setMaturityAmount(req.getNewMaturityAmount());
        newFdr.setJointLienMarked(req.getJointLienMarked());
        newFdr.setJointHolderName(req.getJointHolderName() != null ? req.getJointHolderName() : oldFdr.getJointHolderName());
        newFdr.setInstrumentEvent("RENEWAL");
        newFdr.setComplianceReference(oldFdr.getComplianceReference() + "/REN");
        newFdr.setInstrumentStatus(InstrumentStatus.ACTIVE);
        newFdr.setVerificationStatus(VerificationStatus.PENDING_SCRUTINY);
        newFdr.setAssignedReviewerId(oldFdr.getAssignedReviewerId());
        newFdr.setAssignedReviewerName(oldFdr.getAssignedReviewerName());
        newFdr.setPreviousFdrId(oldFdr.getId());
        newFdr.setPriority(Priority.MEDIUM);
        newFdr.setRemarks("Renewed against original instrument: " + oldFdr.getFdrNumber() + ". " + (req.getRemarks() != null ? req.getRemarks() : ""));
        newFdr.setCreatedAt(dataStore.now());
        newFdr.setUpdatedAt(dataStore.now());

        // Update old FDR status to RENEWED and link nextFdrId
        oldFdr.setInstrumentStatus(InstrumentStatus.RENEWED);
        oldFdr.setNextFdrId(newId);
        oldFdr.setUpdatedAt(dataStore.now());

        dataStore.saveFdr(oldFdr);
        dataStore.saveFdr(newFdr);

        // Add renewal document entry if title given
        if (req.getRenewalDocumentTitle() != null && !req.getRenewalDocumentTitle().isBlank()) {
            DocumentRecord doc = new DocumentRecord();
            doc.setId("DOC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            doc.setFdrId(newId);
            doc.setInstitutionId(newFdr.getInstitutionId());
            doc.setDocumentType(DocumentType.RENEWAL_RECEIPT);
            doc.setTitle(req.getRenewalDocumentTitle());
            doc.setFileName("Renewal_Receipt_" + newFdr.getFdrNumber().replaceAll("[^a-zA-Z0-9]", "_") + ".pdf");
            doc.setFileSize("1.5 MB");
            doc.setFileContentType("application/pdf");
            doc.setReceivedDate(dataStore.today());
            doc.setUploadedDate(dataStore.today());
            doc.setUploadedBy(req.getPerformedBy() != null ? req.getPerformedBy() : "sen.a@aicte-india.org");
            doc.setSourceReference(req.getRenewalDocumentSource() != null ? req.getRenewalDocumentSource() : "Official Institution Submission");
            doc.setVersion(1);
            doc.setStatus(DocumentStatus.PENDING_REVIEW);
            doc.setNotes("Renewal FDR submission attached. Pending scrutiny verification.");
            dataStore.saveDocument(doc);
        }

        dataStore.addAuditEntry(
                "RENEWAL", "FDR", newId,
                req.getPerformedBy() != null ? req.getPerformedBy() : "sen.a@aicte-india.org", "ROLE_REVIEWER",
                "Recorded renewal of FDR " + oldFdr.getFdrNumber() + " with new instrument: " + newFdr.getFdrNumber() + " (Maturity: " + newFdr.getMaturityDate() + ")",
                oldFdr.getFdrNumber(), newFdr.getFdrNumber()
        );

        dataStore.recalculateAllStatuses();
        return newFdr;
    }

    public void assignReviewer(String fdrId, String reviewerId, String performedBy, String userRole) {
        FdrInstrument fdr = dataStore.fdrInstruments.get(fdrId);
        InternalUser user = dataStore.users.get(reviewerId);
        if (fdr != null && user != null) {
            String prev = fdr.getAssignedReviewerName();
            fdr.setAssignedReviewerId(user.getId());
            fdr.setAssignedReviewerName(user.getName());
            fdr.setUpdatedAt(dataStore.now());
            dataStore.saveFdr(fdr);

            dataStore.addAuditEntry(
                    "ASSIGN", "FDR", fdrId, performedBy, userRole,
                    "Reassigned reviewer for FDR " + fdr.getFdrNumber() + " from '" + prev + "' to '" + user.getName() + "'",
                    prev, user.getName()
            );
        }
    }
}

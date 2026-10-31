package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.dto.ReleaseCaseDecisionDto;
import com.Muthu.AICTE_FDRMS.dto.ReleaseCompletionDto;
import com.Muthu.AICTE_FDRMS.model.*;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReleaseRefundService {

    private final DataStore dataStore;

    public ReleaseRefundService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<ReleaseRefundCase> getAllCases(CaseStatus status, String institutionId) {
        return dataStore.releaseCases.values().stream()
                .filter(c -> {
                    if (status != null && c.getCaseStatus() != status) return false;
                    if (institutionId != null && !institutionId.isBlank() && !institutionId.equals(c.getInstitutionId())) return false;
                    return true;
                })
                .sorted(Comparator.comparing(ReleaseRefundCase::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public Optional<ReleaseRefundCase> getCaseById(String id) {
        return Optional.ofNullable(dataStore.releaseCases.get(id));
    }

    public ReleaseRefundCase createCase(ReleaseRefundCase req, String userEmail, String userRole) {
        FdrInstrument fdr = dataStore.fdrInstruments.get(req.getFdrId());
        if (fdr == null) {
            throw new IllegalArgumentException("FDR not found with ID: " + req.getFdrId());
        }

        String id = "REL-" + Calendar.getInstance().get(Calendar.YEAR) + "-" + String.format("%03d", dataStore.releaseCases.size() + 1);
        req.setId(id);
        req.setInstitutionId(fdr.getInstitutionId());
        req.setInstitutionName(fdr.getInstitutionName());
        req.setInstitutionAicteId(fdr.getInstitutionAicteId());
        req.setFdrNumber(fdr.getFdrNumber());
        req.setAmount(fdr.getAmount());
        req.setRequestDate(req.getRequestDate() != null ? req.getRequestDate() : dataStore.today());
        req.setCaseStatus(CaseStatus.AWAITING_SCRUTINY);
        req.setAuthorityDecision("PENDING");
        req.setCreatedAt(dataStore.now());
        req.setUpdatedAt(dataStore.now());

        // Initialize checklist with defaults
        if (req.getComplianceChecklist().isEmpty()) {
            req.getComplianceChecklist().put("tenureCompleted", false);
            req.getComplianceChecklist().put("noOutstandingLiabilities", false);
            req.getComplianceChecklist().put("originalFdrSurrendered", false);
            req.getComplianceChecklist().put("courtCaseClearance", false);
            req.getComplianceChecklist().put("stateNocReceived", false);
        }

        // Mark instrument status as RELEASE_PENDING
        fdr.setInstrumentStatus(InstrumentStatus.RELEASE_PENDING);
        fdr.setUpdatedAt(dataStore.now());
        dataStore.saveFdr(fdr);

        dataStore.saveReleaseCase(req);

        dataStore.addAuditEntry(
                "CREATE", "RELEASE_CASE", id, userEmail, userRole,
                "Initiated Security Deposit Release/Refund Case: " + id + " for FDR " + fdr.getFdrNumber() + " (Reason: " + req.getRequestReason() + ")",
                null, id
        );

        return req;
    }

    public Optional<ReleaseRefundCase> updateScrutinyAndRecommendation(String id, Map<String, Boolean> checklist,
                                                                      String recommendation, String reviewerNotes,
                                                                      String userEmail, String userRole) {
        ReleaseRefundCase c = dataStore.releaseCases.get(id);
        if (c == null) return Optional.empty();

        if (checklist != null) c.setComplianceChecklist(checklist);
        c.setScrutinyRecommendation(recommendation);
        c.setReviewerNotes(reviewerNotes);
        c.setReviewedBy(userEmail);
        c.setReviewedAt(dataStore.now());

        if ("RECOMMENDED_FOR_RELEASE".equalsIgnoreCase(recommendation)) {
            c.setCaseStatus(CaseStatus.AWAITING_APPROVAL);
        } else if ("RECOMMENDED_FOR_REJECTION".equalsIgnoreCase(recommendation)) {
            c.setCaseStatus(CaseStatus.DISCREPANCY_NOTED);
        } else {
            c.setCaseStatus(CaseStatus.SCRUTINY_IN_PROGRESS);
        }
        c.setUpdatedAt(dataStore.now());
        dataStore.saveReleaseCase(c);

        dataStore.addAuditEntry(
                "UPDATE", "RELEASE_CASE", id, userEmail, userRole,
                "Scrutiny recommendation updated: " + recommendation + " for case " + id,
                null, recommendation
        );

        return Optional.of(c);
    }

    public Optional<ReleaseRefundCase> recordAuthorityDecision(ReleaseCaseDecisionDto dto, String userEmail, String userRole) {
        ReleaseRefundCase c = dataStore.releaseCases.get(dto.getCaseId());
        if (c == null) return Optional.empty();

        c.setAuthorityDecision(dto.getDecision());
        c.setSanctionOrderNumber(dto.getSanctionOrderNumber());
        c.setAuthorityRemarks(dto.getAuthorityRemarks());
        c.setDecisionDate(dto.getDecisionDate() != null ? dto.getDecisionDate() : dataStore.today());
        c.setAuthorizedBy(userEmail);

        if ("APPROVED".equalsIgnoreCase(dto.getDecision())) {
            c.setCaseStatus(CaseStatus.APPROVED);
        } else if ("REJECTED".equalsIgnoreCase(dto.getDecision())) {
            c.setCaseStatus(CaseStatus.REJECTED);
            // Revert FDR status back to ACTIVE if rejected
            FdrInstrument fdr = dataStore.fdrInstruments.get(c.getFdrId());
            if (fdr != null) {
                fdr.setInstrumentStatus(InstrumentStatus.ACTIVE);
                fdr.setUpdatedAt(dataStore.now());
                dataStore.saveFdr(fdr);
            }
        } else if ("REFERRED_BACK".equalsIgnoreCase(dto.getDecision())) {
            c.setCaseStatus(CaseStatus.SCRUTINY_IN_PROGRESS);
        }
        c.setUpdatedAt(dataStore.now());
        dataStore.saveReleaseCase(c);

        dataStore.addAuditEntry(
                "APPROVE", "RELEASE_CASE", c.getId(), userEmail, userRole,
                "Competent Authority decision recorded: " + dto.getDecision() + " (Order No: " + dto.getSanctionOrderNumber() + ")",
                "PENDING", dto.getDecision()
        );

        return Optional.of(c);
    }

    public Optional<ReleaseRefundCase> recordReleaseCompletion(ReleaseCompletionDto dto, String userEmail, String userRole) {
        ReleaseRefundCase c = dataStore.releaseCases.get(dto.getCaseId());
        if (c == null) return Optional.empty();

        if (c.getCaseStatus() != CaseStatus.APPROVED) {
            throw new IllegalStateException("Cannot complete discharge before Competent Authority formal approval.");
        }

        c.setDischargeCertificateNo(dto.getDischargeCertificateNo());
        c.setDispatchReference(dto.getDispatchReference());
        c.setCompletionRemarks(dto.getCompletionRemarks());
        c.setReleaseCompletionDate(dto.getReleaseCompletionDate() != null ? dto.getReleaseCompletionDate() : dataStore.today());
        c.setCompletedBy(userEmail);
        c.setCaseStatus(CaseStatus.COMPLETED);
        c.setUpdatedAt(dataStore.now());

        // Update instrument status to RELEASED
        FdrInstrument fdr = dataStore.fdrInstruments.get(c.getFdrId());
        if (fdr != null) {
            fdr.setInstrumentStatus(InstrumentStatus.RELEASED);
            fdr.setRemarks("Officially discharged under certificate: " + dto.getDischargeCertificateNo());
            fdr.setUpdatedAt(dataStore.now());
            dataStore.saveFdr(fdr);
        }
        dataStore.saveReleaseCase(c);

        dataStore.addAuditEntry(
                "RELEASE_RECORDED", "RELEASE_CASE", c.getId(), userEmail, userRole,
                "Discharge process recorded: Discharge Cert: " + dto.getDischargeCertificateNo() + ", Dispatch: " + dto.getDispatchReference(),
                "APPROVED", "COMPLETED"
        );

        return Optional.of(c);
    }
}

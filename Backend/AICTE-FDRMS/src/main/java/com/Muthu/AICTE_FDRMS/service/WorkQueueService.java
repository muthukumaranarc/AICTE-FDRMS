package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.*;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkQueueService {

    private final DataStore dataStore;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public WorkQueueService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Map<String, Object> getQueueSummary() {
        dataStore.recalculateAllStatuses();
        Map<String, Object> map = new HashMap<>();

        map.put("pendingVerificationCount", getPendingVerificationQueue().size());
        map.put("discrepanciesCount", getDiscrepanciesQueue().size());
        map.put("missingDocumentsCount", getMissingDocumentsQueue().size());
        map.put("upcomingExpiriesCount", getUpcomingExpiriesQueue().size());
        map.put("overdueRenewalsCount", getOverdueRenewalsQueue().size());
        map.put("releaseScrutinyCount", getReleaseScrutinyQueue().size());
        map.put("authorityApprovalCount", getAuthorityApprovalQueue().size());

        // Supervisor Workload Breakdown
        Map<String, Long> reviewerWorkload = new HashMap<>();
        for (InternalUser u : dataStore.users.values()) {
            long count = dataStore.fdrInstruments.values().stream()
                    .filter(f -> u.getId().equals(f.getAssignedReviewerId()) || u.getName().equalsIgnoreCase(f.getAssignedReviewerName()))
                    .filter(f -> f.getInstrumentStatus() != InstrumentStatus.RELEASED && f.getInstrumentStatus() != InstrumentStatus.CLOSED)
                    .count();
            reviewerWorkload.put(u.getName() + " (" + u.getRole() + ")", count);
        }
        map.put("workloadByOfficial", reviewerWorkload);

        return map;
    }

    public List<Map<String, Object>> getPendingVerificationQueue() {
        return dataStore.fdrInstruments.values().stream()
                .filter(f -> f.getVerificationStatus() == VerificationStatus.PENDING_SCRUTINY ||
                             f.getVerificationStatus() == VerificationStatus.UNDER_REVIEW)
                .map(this::wrapQueueItem)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDiscrepanciesQueue() {
        return dataStore.fdrInstruments.values().stream()
                .filter(f -> f.getVerificationStatus() == VerificationStatus.DISCREPANCY_FOUND ||
                             Boolean.TRUE.equals(f.getFlagDiscrepancy()))
                .map(this::wrapQueueItem)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMissingDocumentsQueue() {
        return dataStore.fdrInstruments.values().stream()
                .filter(f -> Boolean.TRUE.equals(f.getFlagMissingDocuments()))
                .map(this::wrapQueueItem)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUpcomingExpiriesQueue() {
        return dataStore.fdrInstruments.values().stream()
                .filter(f -> f.getInstrumentStatus() == InstrumentStatus.EXPIRING_SOON)
                .map(this::wrapQueueItem)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getOverdueRenewalsQueue() {
        return dataStore.fdrInstruments.values().stream()
                .filter(f -> f.getInstrumentStatus() == InstrumentStatus.OVERDUE ||
                             f.getInstrumentStatus() == InstrumentStatus.RENEWAL_PENDING)
                .map(this::wrapQueueItem)
                .collect(Collectors.toList());
    }

    public List<ReleaseRefundCase> getReleaseScrutinyQueue() {
        return dataStore.releaseCases.values().stream()
                .filter(c -> c.getCaseStatus() == CaseStatus.AWAITING_SCRUTINY ||
                             c.getCaseStatus() == CaseStatus.SCRUTINY_IN_PROGRESS)
                .collect(Collectors.toList());
    }

    public List<ReleaseRefundCase> getAuthorityApprovalQueue() {
        return dataStore.releaseCases.values().stream()
                .filter(c -> c.getCaseStatus() == CaseStatus.AWAITING_APPROVAL)
                .collect(Collectors.toList());
    }

    private Map<String, Object> wrapQueueItem(FdrInstrument f) {
        Map<String, Object> m = new HashMap<>();
        m.put("instrument", f);

        long ageDays = 0;
        try {
            if (f.getCreatedAt() != null) {
                LocalDate created = LocalDate.parse(f.getCreatedAt().substring(0, 10), dateFormatter);
                ageDays = ChronoUnit.DAYS.between(created, LocalDate.now());
            }
        } catch (Exception ignored) {}

        long daysToMaturity = 0;
        try {
            if (f.getMaturityDate() != null) {
                LocalDate mat = LocalDate.parse(f.getMaturityDate(), dateFormatter);
                daysToMaturity = ChronoUnit.DAYS.between(LocalDate.now(), mat);
            }
        } catch (Exception ignored) {}

        m.put("ageDays", ageDays);
        m.put("daysToMaturity", daysToMaturity);

        String nextAction;
        if (f.getVerificationStatus() == VerificationStatus.DISCREPANCY_FOUND) {
            nextAction = "Resolve Discrepancy with Issuing Bank / College";
        } else if (f.getVerificationStatus() == VerificationStatus.PENDING_SCRUTINY) {
            nextAction = "Initiate Bank Verification Letter & Document Scrutiny";
        } else if (f.getInstrumentStatus() == InstrumentStatus.OVERDUE) {
            nextAction = "Issue Renewal Show-Cause Notice to Institution";
        } else if (f.getInstrumentStatus() == InstrumentStatus.EXPIRING_SOON) {
            nextAction = "Send 60-Day Advance Renewal Advisory";
        } else if (Boolean.TRUE.equals(f.getFlagMissingDocuments())) {
            nextAction = "Demand Missing Documents from Institution";
        } else {
            nextAction = "Routine Administrative Monitoring";
        }

        m.put("nextRequiredAction", nextAction);
        return m;
    }
}

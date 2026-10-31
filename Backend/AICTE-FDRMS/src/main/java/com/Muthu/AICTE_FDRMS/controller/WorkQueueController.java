package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.model.ReleaseRefundCase;
import com.Muthu.AICTE_FDRMS.service.WorkQueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queues")
public class WorkQueueController {

    private final WorkQueueService workQueueService;

    public WorkQueueController(WorkQueueService workQueueService) {
        this.workQueueService = workQueueService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(workQueueService.getQueueSummary());
    }

    @GetMapping("/pending-verification")
    public ResponseEntity<List<Map<String, Object>>> getPendingVerification() {
        return ResponseEntity.ok(workQueueService.getPendingVerificationQueue());
    }

    @GetMapping("/discrepancies")
    public ResponseEntity<List<Map<String, Object>>> getDiscrepancies() {
        return ResponseEntity.ok(workQueueService.getDiscrepanciesQueue());
    }

    @GetMapping("/missing-documents")
    public ResponseEntity<List<Map<String, Object>>> getMissingDocuments() {
        return ResponseEntity.ok(workQueueService.getMissingDocumentsQueue());
    }

    @GetMapping("/upcoming-expiries")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingExpiries() {
        return ResponseEntity.ok(workQueueService.getUpcomingExpiriesQueue());
    }

    @GetMapping("/overdue-renewals")
    public ResponseEntity<List<Map<String, Object>>> getOverdueRenewals() {
        return ResponseEntity.ok(workQueueService.getOverdueRenewalsQueue());
    }

    @GetMapping("/release-scrutiny")
    public ResponseEntity<List<ReleaseRefundCase>> getReleaseScrutiny() {
        return ResponseEntity.ok(workQueueService.getReleaseScrutinyQueue());
    }

    @GetMapping("/authority-approval")
    public ResponseEntity<List<ReleaseRefundCase>> getAuthorityApproval() {
        return ResponseEntity.ok(workQueueService.getAuthorityApprovalQueue());
    }
}

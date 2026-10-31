package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.dto.ReleaseCaseDecisionDto;
import com.Muthu.AICTE_FDRMS.dto.ReleaseCompletionDto;
import com.Muthu.AICTE_FDRMS.model.CaseStatus;
import com.Muthu.AICTE_FDRMS.model.ReleaseRefundCase;
import com.Muthu.AICTE_FDRMS.service.ReleaseRefundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/release-cases")
public class ReleaseRefundController {

    private final ReleaseRefundService releaseRefundService;

    public ReleaseRefundController(ReleaseRefundService releaseRefundService) {
        this.releaseRefundService = releaseRefundService;
    }

    @GetMapping
    public ResponseEntity<List<ReleaseRefundCase>> getAllCases(
            @RequestParam(required = false) CaseStatus status,
            @RequestParam(required = false) String institutionId) {
        return ResponseEntity.ok(releaseRefundService.getAllCases(status, institutionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReleaseRefundCase> getCaseById(@PathVariable String id) {
        return releaseRefundService.getCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReleaseRefundCase> createCase(
            @RequestBody ReleaseRefundCase req,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        return ResponseEntity.ok(releaseRefundService.createCase(req, userEmail, userRole));
    }

    @PutMapping("/{id}/scrutiny")
    public ResponseEntity<ReleaseRefundCase> updateScrutiny(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        @SuppressWarnings("unchecked")
        Map<String, Boolean> checklist = (Map<String, Boolean>) body.get("checklist");
        String recommendation = (String) body.get("recommendation");
        String reviewerNotes = (String) body.get("reviewerNotes");

        return releaseRefundService.updateScrutinyAndRecommendation(id, checklist, recommendation, reviewerNotes, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/decision")
    public ResponseEntity<ReleaseRefundCase> recordDecision(
            @PathVariable String id,
            @RequestBody ReleaseCaseDecisionDto dto,
            @RequestHeader(value = "X-User-Email", defaultValue = "sharma.r@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_APPROVER") String userRole) {
        dto.setCaseId(id);
        return releaseRefundService.recordAuthorityDecision(dto, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ReleaseRefundCase> recordCompletion(
            @PathVariable String id,
            @RequestBody ReleaseCompletionDto dto,
            @RequestHeader(value = "X-User-Email", defaultValue = "patel.v@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_ADMIN") String userRole) {
        dto.setCaseId(id);
        return releaseRefundService.recordReleaseCompletion(dto, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

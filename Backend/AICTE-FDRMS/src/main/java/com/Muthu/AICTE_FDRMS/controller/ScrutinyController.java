package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.dto.ScrutinyObservationRequestDto;
import com.Muthu.AICTE_FDRMS.dto.VerificationRequestDto;
import com.Muthu.AICTE_FDRMS.model.ScrutinyObservation;
import com.Muthu.AICTE_FDRMS.model.ScrutinyVerificationRecord;
import com.Muthu.AICTE_FDRMS.service.ScrutinyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scrutiny")
public class ScrutinyController {

    private final ScrutinyService scrutinyService;

    public ScrutinyController(ScrutinyService scrutinyService) {
        this.scrutinyService = scrutinyService;
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<ScrutinyVerificationRecord>> getVerifications(@RequestParam String fdrId) {
        return ResponseEntity.ok(scrutinyService.getVerificationsForFdr(fdrId));
    }

    @GetMapping("/observations")
    public ResponseEntity<List<ScrutinyObservation>> getObservations(@RequestParam String fdrId) {
        return ResponseEntity.ok(scrutinyService.getObservationsForFdr(fdrId));
    }

    @PostMapping("/verify")
    public ResponseEntity<ScrutinyVerificationRecord> recordVerification(
            @RequestBody VerificationRequestDto req,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        return ResponseEntity.ok(scrutinyService.recordVerification(req, userEmail, userRole));
    }

    @PostMapping("/observations")
    public ResponseEntity<ScrutinyObservation> recordObservation(
            @RequestBody ScrutinyObservationRequestDto req,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        return ResponseEntity.ok(scrutinyService.recordObservation(req, userEmail, userRole));
    }

    @PatchMapping("/observations/{id}/resolve")
    public ResponseEntity<ScrutinyObservation> resolveObservation(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        String notes = body.get("resolutionNotes");
        return scrutinyService.resolveObservation(id, notes != null ? notes : "Resolved by scrutiny officer", userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

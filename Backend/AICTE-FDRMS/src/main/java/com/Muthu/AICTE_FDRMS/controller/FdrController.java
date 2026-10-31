package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.dto.RenewalRequestDto;
import com.Muthu.AICTE_FDRMS.model.FdrInstrument;
import com.Muthu.AICTE_FDRMS.model.InstrumentStatus;
import com.Muthu.AICTE_FDRMS.model.VerificationStatus;
import com.Muthu.AICTE_FDRMS.service.FdrService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fdrs")
public class FdrController {

    private final FdrService fdrService;

    public FdrController(FdrService fdrService) {
        this.fdrService = fdrService;
    }

    @GetMapping
    public ResponseEntity<List<FdrInstrument>> getAllFdrs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String institutionId,
            @RequestParam(required = false) String bank,
            @RequestParam(required = false) InstrumentStatus status,
            @RequestParam(required = false) VerificationStatus verifStatus,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String reviewer) {
        return ResponseEntity.ok(fdrService.getAllFdrs(query, institutionId, bank, status, verifStatus, minAmount, maxAmount, reviewer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FdrInstrument> getFdrById(@PathVariable String id) {
        return fdrService.getFdrById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-duplicates")
    public ResponseEntity<List<FdrInstrument>> checkDuplicates(
            @RequestParam String fdrNumber,
            @RequestParam(required = false) String excludeId) {
        return ResponseEntity.ok(fdrService.checkDuplicates(fdrNumber, excludeId));
    }

    @PostMapping
    public ResponseEntity<FdrInstrument> createFdr(
            @RequestBody FdrInstrument fdr,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        return ResponseEntity.ok(fdrService.createFdr(fdr, userEmail, userRole));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FdrInstrument> updateFdr(
            @PathVariable String id,
            @RequestBody FdrInstrument fdr,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        return fdrService.updateFdr(id, fdr, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/renew")
    public ResponseEntity<FdrInstrument> recordRenewal(@RequestBody RenewalRequestDto req) {
        return ResponseEntity.ok(fdrService.recordRenewal(req));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assignReviewer(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        String reviewerId = body.get("reviewerId");
        if (reviewerId != null) {
            fdrService.assignReviewer(id, reviewerId, userEmail, userRole);
        }
        return ResponseEntity.ok().build();
    }
}

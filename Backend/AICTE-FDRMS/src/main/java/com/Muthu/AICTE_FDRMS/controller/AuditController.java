package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.model.AuditTrailEntry;
import com.Muthu.AICTE_FDRMS.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<AuditTrailEntry>> getAuditTrail(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String user) {
        return ResponseEntity.ok(auditService.getAuditTrail(entityType, entityId, action, user));
    }
}

package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.model.Institution;
import com.Muthu.AICTE_FDRMS.service.InstitutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    @GetMapping
    public ResponseEntity<List<Institution>> getAllInstitutions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(institutionService.getAllInstitutions(query, state, type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Institution> getInstitutionById(@PathVariable String id) {
        return institutionService.getInstitutionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getInstitutionDetails(@PathVariable String id) {
        Map<String, Object> details = institutionService.getInstitutionDetailsWithHoldings(id);
        if (details == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(details);
    }

    @GetMapping("/check-duplicates")
    public ResponseEntity<List<Institution>> checkDuplicates(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String aicteId,
            @RequestParam(required = false) String excludeId) {
        return ResponseEntity.ok(institutionService.checkDuplicates(name, aicteId, excludeId));
    }

    @PostMapping
    public ResponseEntity<Institution> createInstitution(
            @RequestBody Institution institution,
            @RequestHeader(value = "X-User-Email", defaultValue = "patel.v@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_ADMIN") String userRole) {
        return ResponseEntity.ok(institutionService.createInstitution(institution, userEmail, userRole));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Institution> updateInstitution(
            @PathVariable String id,
            @RequestBody Institution institution,
            @RequestHeader(value = "X-User-Email", defaultValue = "patel.v@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_ADMIN") String userRole) {
        return institutionService.updateInstitution(id, institution, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

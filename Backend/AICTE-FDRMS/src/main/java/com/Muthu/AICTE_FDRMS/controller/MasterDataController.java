package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.model.MasterConfiguration;
import com.Muthu.AICTE_FDRMS.service.MasterDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/master-data")
public class MasterDataController {

    private final MasterDataService masterDataService;

    public MasterDataController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping
    public ResponseEntity<MasterConfiguration> getConfiguration() {
        return ResponseEntity.ok(masterDataService.getConfiguration());
    }

    @PutMapping
    public ResponseEntity<MasterConfiguration> updateConfiguration(
            @RequestBody MasterConfiguration config,
            @RequestHeader(value = "X-User-Email", defaultValue = "patel.v@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_ADMIN") String userRole) {
        return ResponseEntity.ok(masterDataService.updateConfiguration(config, userEmail, userRole));
    }

    @PostMapping("/reset-official-data")
    public ResponseEntity<Map<String, Object>> resetOfficialData() {
        return ResponseEntity.ok(masterDataService.resetOfficialDataset());
    }
}

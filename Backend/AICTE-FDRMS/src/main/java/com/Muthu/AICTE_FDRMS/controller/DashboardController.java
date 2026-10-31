package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.dto.DashboardStatsDto;
import com.Muthu.AICTE_FDRMS.service.FdrService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final FdrService fdrService;

    public DashboardController(FdrService fdrService) {
        this.fdrService = fdrService;
    }

    @GetMapping({"", "/stats"})
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(fdrService.getDashboardStats());
    }
}

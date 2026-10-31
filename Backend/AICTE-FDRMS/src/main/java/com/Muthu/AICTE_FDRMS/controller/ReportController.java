package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/institution-holdings")
    public ResponseEntity<Map<String, Object>> getInstitutionHoldings() {
        return ResponseEntity.ok(reportService.getInstitutionHoldingsReport());
    }

    @GetMapping("/bank-concentration")
    public ResponseEntity<Map<String, Object>> getBankConcentration() {
        return ResponseEntity.ok(reportService.getBankConcentrationReport());
    }

    @GetMapping("/export/csv")
    public ResponseEntity<String> exportCsv(@RequestParam(defaultValue = "holdings") String type) {
        String csv = reportService.generateCsvExport(type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"AICTE_FDR_Report_" + type + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}

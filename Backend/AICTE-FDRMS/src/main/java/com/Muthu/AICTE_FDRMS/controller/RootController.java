package com.Muthu.AICTE_FDRMS.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Public Root & Health Check Controller for AICTE-FDRMS Backend.
 * Provides welcome banner, operational health status, and API registry for browser visits.
 */
@RestController
public class RootController {

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping({"/", "/api", "/api/health"})
    public ResponseEntity<Map<String, Object>> getApiOverview() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "AICTE-FDRMS Security Deposit & FDR Management System");
        response.put("status", "UP");
        response.put("environment", "Production / Render Cloud");
        response.put("timestamp", LocalDateTime.now().format(formatter));
        response.put("database", "MongoDB Atlas Connected (AWS Mumbai ap-south-1)");
        
        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("masterData", "/api/master-data");
        endpoints.put("dashboard", "/api/dashboard");
        endpoints.put("institutions", "/api/institutions");
        endpoints.put("fdrs", "/api/fdrs");
        endpoints.put("releaseCases", "/api/release-cases");
        endpoints.put("workQueues", "/api/queues/summary");
        endpoints.put("aiAssistantProxy", "/api/ai/chat");
        response.put("endpoints", endpoints);

        response.put("frontendPortal", "https://muthukumaranarc.github.io/AICTE-FDRMS/");
        return ResponseEntity.ok(response);
    }
}

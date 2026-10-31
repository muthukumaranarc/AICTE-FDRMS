package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.*;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final DataStore dataStore;

    public ReportService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Map<String, Object> getInstitutionHoldingsReport() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> rows = new ArrayList<>();
        double grandTotal = 0;
        int totalInstrumentsCount = 0;

        for (Institution inst : dataStore.institutions.values()) {
            List<FdrInstrument> instFdrs = dataStore.fdrInstruments.values().stream()
                    .filter(f -> inst.getId().equals(f.getInstitutionId()))
                    .collect(Collectors.toList());

            double totalAmt = instFdrs.stream().mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0.0).sum();
            grandTotal += totalAmt;
            totalInstrumentsCount += instFdrs.size();

            Map<String, Object> row = new HashMap<>();
            row.put("institutionId", inst.getId());
            row.put("aictePermanentId", inst.getAictePermanentId());
            row.put("name", inst.getName());
            row.put("state", inst.getState());
            row.put("institutionType", inst.getInstitutionType());
            row.put("instrumentCount", instFdrs.size());
            row.put("totalDepositAmount", totalAmt);
            row.put("instruments", instFdrs);
            rows.add(row);
        }

        rows.sort((a, b) -> Double.compare((Double) b.get("totalDepositAmount"), (Double) a.get("totalDepositAmount")));

        result.put("rows", rows);
        result.put("grandTotalAmount", grandTotal);
        result.put("totalInstitutions", dataStore.institutions.size());
        result.put("totalInstrumentsCount", totalInstrumentsCount);
        return result;
    }

    public Map<String, Object> getBankConcentrationReport() {
        Map<String, Object> result = new HashMap<>();
        Map<String, Double> bankSums = new HashMap<>();
        Map<String, Integer> bankCounts = new HashMap<>();

        for (FdrInstrument f : dataStore.fdrInstruments.values()) {
            String b = f.getBankName() != null ? f.getBankName() : "Unknown Bank";
            double amt = f.getAmount() != null ? f.getAmount() : 0.0;
            bankSums.put(b, bankSums.getOrDefault(b, 0.0) + amt);
            bankCounts.put(b, bankCounts.getOrDefault(b, 0) + 1);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (String b : bankSums.keySet()) {
            Map<String, Object> r = new HashMap<>();
            r.put("bankName", b);
            r.put("totalAmount", bankSums.get(b));
            r.put("count", bankCounts.get(b));
            rows.add(r);
        }
        rows.sort((a, b) -> Double.compare((Double) b.get("totalAmount"), (Double) a.get("totalAmount")));

        result.put("banks", rows);
        result.put("totalDeposits", dataStore.fdrInstruments.values().stream().mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0.0).sum());
        return result;
    }

    public String generateCsvExport(String reportType) {
        StringBuilder csv = new StringBuilder();
        if ("holdings".equalsIgnoreCase(reportType)) {
            csv.append("AICTE Permanent ID,Institution Name,State,Type,FDR Number,Bank,Amount (INR),Issue Date,Maturity Date,Instrument Status,Verification Status\n");
            for (FdrInstrument f : dataStore.fdrInstruments.values()) {
                csv.append(escape(f.getInstitutionAicteId())).append(",")
                   .append(escape(f.getInstitutionName())).append(",")
                   .append(",") // state
                   .append(escape(f.getInstrumentType() != null ? f.getInstrumentType().toString() : "")).append(",")
                   .append(escape(f.getFdrNumber())).append(",")
                   .append(escape(f.getBankName())).append(",")
                   .append(f.getAmount()).append(",")
                   .append(escape(f.getIssueDate())).append(",")
                   .append(escape(f.getMaturityDate())).append(",")
                   .append(escape(f.getInstrumentStatus() != null ? f.getInstrumentStatus().toString() : "")).append(",")
                   .append(escape(f.getVerificationStatus() != null ? f.getVerificationStatus().toString() : "")).append("\n");
            }
        } else if ("release".equalsIgnoreCase(reportType)) {
            csv.append("Case ID,Institution Name,FDR Number,Amount,Reason,Status,Decision,Sanction Order No,Discharge Cert No\n");
            for (ReleaseRefundCase c : dataStore.releaseCases.values()) {
                csv.append(escape(c.getId())).append(",")
                   .append(escape(c.getInstitutionName())).append(",")
                   .append(escape(c.getFdrNumber())).append(",")
                   .append(c.getAmount()).append(",")
                   .append(escape(c.getRequestReason())).append(",")
                   .append(escape(c.getCaseStatus() != null ? c.getCaseStatus().toString() : "")).append(",")
                   .append(escape(c.getAuthorityDecision())).append(",")
                   .append(escape(c.getSanctionOrderNumber())).append(",")
                   .append(escape(c.getDischargeCertificateNo())).append("\n");
            }
        } else {
            csv.append("ID,Entity Type,Action,User,Role,Timestamp,Details\n");
            for (AuditTrailEntry a : dataStore.auditTrail) {
                csv.append(escape(a.getId())).append(",")
                   .append(escape(a.getEntityType())).append(",")
                   .append(escape(a.getAction())).append(",")
                   .append(escape(a.getPerformedBy())).append(",")
                   .append(escape(a.getUserRole())).append(",")
                   .append(escape(a.getTimestamp())).append(",")
                   .append(escape(a.getDetails())).append("\n");
            }
        }
        return csv.toString();
    }

    private String escape(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}

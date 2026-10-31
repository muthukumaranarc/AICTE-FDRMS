package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.dto.ScrutinyObservationRequestDto;
import com.Muthu.AICTE_FDRMS.dto.VerificationRequestDto;
import com.Muthu.AICTE_FDRMS.model.*;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScrutinyService {

    private final DataStore dataStore;

    public ScrutinyService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<ScrutinyVerificationRecord> getVerificationsForFdr(String fdrId) {
        return dataStore.verifications.values().stream()
                .filter(v -> fdrId.equals(v.getFdrId()))
                .sorted(Comparator.comparing(ScrutinyVerificationRecord::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public List<ScrutinyObservation> getObservationsForFdr(String fdrId) {
        return dataStore.observations.values().stream()
                .filter(o -> fdrId.equals(o.getFdrId()))
                .sorted(Comparator.comparing(ScrutinyObservation::getRecordedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public ScrutinyVerificationRecord recordVerification(VerificationRequestDto req, String userEmail, String userRole) {
        FdrInstrument fdr = dataStore.fdrInstruments.get(req.getFdrId());
        if (fdr == null) {
            throw new IllegalArgumentException("FDR not found: " + req.getFdrId());
        }

        String verId = "VER-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        ScrutinyVerificationRecord ver = new ScrutinyVerificationRecord();
        ver.setId(verId);
        ver.setFdrId(fdr.getId());
        ver.setInstitutionId(fdr.getInstitutionId());
        ver.setVerificationMethod(req.getVerificationMethod());
        ver.setVerificationSource(req.getVerificationSource());
        ver.setReferenceNumber(req.getReferenceNumber());
        ver.setVerificationDate(req.getVerificationDate() != null ? req.getVerificationDate() : dataStore.today());
        ver.setResult(req.getResult());
        ver.setVerifiedBy(userEmail);
        ver.setConfirmedAmount(req.getConfirmedAmount());
        ver.setConfirmedMaturityDate(req.getConfirmedMaturityDate());
        ver.setConfirmedLienStatus(req.getConfirmedLienStatus());
        ver.setDiscrepancyDetails(req.getDiscrepancyDetails());
        ver.setRemarks(req.getRemarks());
        ver.setCreatedAt(dataStore.now());

        // Attach supporting document if title provided
        if (req.getSupportingDocumentTitle() != null && !req.getSupportingDocumentTitle().isBlank()) {
            DocumentRecord doc = new DocumentRecord();
            String docId = "DOC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            doc.setId(docId);
            doc.setFdrId(fdr.getId());
            doc.setInstitutionId(fdr.getInstitutionId());
            doc.setDocumentType(DocumentType.BANK_CONFIRMATION_LETTER);
            doc.setTitle(req.getSupportingDocumentTitle());
            doc.setFileName("Bank_Verification_Evidence_" + ver.getReferenceNumber().replaceAll("[^a-zA-Z0-9]", "_") + ".pdf");
            doc.setFileSize("1.1 MB");
            doc.setFileContentType("application/pdf");
            doc.setReceivedDate(ver.getVerificationDate());
            doc.setUploadedDate(dataStore.today());
            doc.setUploadedBy(userEmail);
            doc.setSourceReference(ver.getReferenceNumber() + " - " + ver.getVerificationSource());
            doc.setVersion(1);
            doc.setStatus(DocumentStatus.ACCEPTED);
            doc.setNotes("Direct bank verification evidence attached.");
            dataStore.saveDocument(doc);
            ver.setSupportingDocumentId(docId);
        }

        dataStore.saveVerification(ver);

        // Update FDR verification status accordingly
        VerificationStatus prevVerifStatus = fdr.getVerificationStatus();
        if ("VERIFIED".equalsIgnoreCase(req.getResult())) {
            fdr.setVerificationStatus(VerificationStatus.VERIFIED);
            fdr.setFlagDiscrepancy(false);
        } else if ("DISCREPANCY_FOUND".equalsIgnoreCase(req.getResult())) {
            fdr.setVerificationStatus(VerificationStatus.DISCREPANCY_FOUND);
            fdr.setFlagDiscrepancy(true);
            fdr.setPriority(Priority.URGENT);

            // Log observation automatically
            ScrutinyObservation obs = new ScrutinyObservation();
            obs.setId("OBS-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            obs.setFdrId(fdr.getId());
            obs.setInstitutionId(fdr.getInstitutionId());
            obs.setCategory("VERIFICATION_DISCREPANCY");
            obs.setSeverity(ScrutinySeverity.CRITICAL);
            obs.setObservation(req.getDiscrepancyDetails() != null ? req.getDiscrepancyDetails() : "Discrepancy found during bank confirmation.");
            obs.setFollowUpRequired(true);
            obs.setActionRequired("Send formal notice to institution and bank branch.");
            obs.setRecordedBy(userEmail);
            obs.setRecordedAt(dataStore.now());
            dataStore.saveObservation(obs);
        } else if ("UNABLE_TO_VERIFY".equalsIgnoreCase(req.getResult())) {
            fdr.setVerificationStatus(VerificationStatus.UNABLE_TO_VERIFY);
            fdr.setPriority(Priority.HIGH);
        }

        fdr.setUpdatedAt(dataStore.now());
        dataStore.saveFdr(fdr);

        dataStore.addAuditEntry(
                "VERIFY", "FDR", fdr.getId(), userEmail, userRole,
                "Bank verification recorded for FDR " + fdr.getFdrNumber() + " -> Result: " + req.getResult() + " (Source: " + req.getVerificationSource() + ")",
                prevVerifStatus != null ? prevVerifStatus.toString() : null,
                fdr.getVerificationStatus().toString()
        );

        return ver;
    }

    public ScrutinyObservation recordObservation(ScrutinyObservationRequestDto req, String userEmail, String userRole) {
        FdrInstrument fdr = dataStore.fdrInstruments.get(req.getFdrId());
        if (fdr == null) {
            throw new IllegalArgumentException("FDR not found: " + req.getFdrId());
        }

        String obsId = "OBS-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        ScrutinyObservation obs = new ScrutinyObservation();
        obs.setId(obsId);
        obs.setFdrId(fdr.getId());
        obs.setInstitutionId(fdr.getInstitutionId());
        obs.setCategory(req.getCategory());
        obs.setSeverity(req.getSeverity() != null ? req.getSeverity() : ScrutinySeverity.MEDIUM);
        obs.setObservation(req.getObservation());
        obs.setFollowUpRequired(req.getFollowUpRequired() != null && req.getFollowUpRequired());
        obs.setActionRequired(req.getActionRequired());
        obs.setRecordedBy(userEmail);
        obs.setRecordedAt(dataStore.now());
        obs.setResolved(false);

        dataStore.saveObservation(obs);

        if (obs.getSeverity() == ScrutinySeverity.HIGH || obs.getSeverity() == ScrutinySeverity.CRITICAL) {
            fdr.setFlagDiscrepancy(true);
            fdr.setPriority(Priority.URGENT);
            dataStore.saveFdr(fdr);
        }

        dataStore.addAuditEntry(
                "SCRUTINY_NOTE", "FDR", fdr.getId(), userEmail, userRole,
                "Scrutiny observation logged: [" + obs.getCategory() + " - " + obs.getSeverity() + "] " + obs.getObservation(),
                null, obs.getObservation()
        );

        return obs;
    }

    public Optional<ScrutinyObservation> resolveObservation(String obsId, String resolutionNotes, String userEmail, String userRole) {
        ScrutinyObservation obs = dataStore.observations.get(obsId);
        if (obs == null) return Optional.empty();

        obs.setResolved(true);
        obs.setResolvedBy(userEmail);
        obs.setResolvedAt(dataStore.now());
        obs.setResolutionNotes(resolutionNotes);
        dataStore.saveObservation(obs);

        dataStore.addAuditEntry(
                "RESOLVE_OBSERVATION", "OBSERVATION", obsId, userEmail, userRole,
                "Observation resolved for FDR " + obs.getFdrId() + ": " + resolutionNotes,
                "UNRESOLVED", "RESOLVED"
        );

        return Optional.of(obs);
    }
}

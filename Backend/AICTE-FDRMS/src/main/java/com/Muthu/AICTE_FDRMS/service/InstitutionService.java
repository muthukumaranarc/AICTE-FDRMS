package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.FdrInstrument;
import com.Muthu.AICTE_FDRMS.model.Institution;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InstitutionService {

    private final DataStore dataStore;

    public InstitutionService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<Institution> getAllInstitutions(String query, String state, String type) {
        return dataStore.institutions.values().stream()
                .filter(i -> {
                    if (query != null && !query.isBlank()) {
                        String q = query.toLowerCase();
                        boolean match = (i.getName() != null && i.getName().toLowerCase().contains(q)) ||
                                        (i.getAictePermanentId() != null && i.getAictePermanentId().toLowerCase().contains(q)) ||
                                        (i.getCurrentApplicationId() != null && i.getCurrentApplicationId().toLowerCase().contains(q)) ||
                                        (i.getDistrict() != null && i.getDistrict().toLowerCase().contains(q));
                        if (!match) return false;
                    }
                    if (state != null && !state.isBlank() && !state.equalsIgnoreCase(i.getState())) return false;
                    if (type != null && !type.isBlank() && !type.equalsIgnoreCase(i.getInstitutionType())) return false;
                    return true;
                })
                .sorted(Comparator.comparing(Institution::getName))
                .collect(Collectors.toList());
    }

    public Optional<Institution> getInstitutionById(String id) {
        return Optional.ofNullable(dataStore.institutions.get(id));
    }

    public List<Institution> checkDuplicates(String name, String aicteId, String excludeId) {
        List<Institution> dupes = new ArrayList<>();
        String cleanName = name != null ? name.trim().toLowerCase() : "";
        String cleanId = aicteId != null ? aicteId.trim().toLowerCase() : "";

        for (Institution inst : dataStore.institutions.values()) {
            if (excludeId != null && excludeId.equals(inst.getId())) continue;

            if (!cleanId.isEmpty() && inst.getAictePermanentId() != null &&
                inst.getAictePermanentId().trim().equalsIgnoreCase(cleanId)) {
                dupes.add(inst);
                continue;
            }

            if (!cleanName.isEmpty() && inst.getName() != null &&
                inst.getName().trim().equalsIgnoreCase(cleanName)) {
                dupes.add(inst);
            }
        }
        return dupes;
    }

    public Institution createInstitution(Institution inst, String userEmail, String userRole) {
        String id = "INST-" + String.format("%03d", dataStore.institutions.size() + 1);
        inst.setId(id);
        inst.setCreatedAt(dataStore.now());
        inst.setUpdatedAt(dataStore.now());

        dataStore.saveInstitution(inst);
        dataStore.addAuditEntry(
                "CREATE", "INSTITUTION", id, userEmail, userRole,
                "Registered new institution profile: " + inst.getName() + " (AICTE ID: " + inst.getAictePermanentId() + ")",
                null, inst.getName()
        );
        return inst;
    }

    public Optional<Institution> updateInstitution(String id, Institution updated, String userEmail, String userRole) {
        Institution existing = dataStore.institutions.get(id);
        if (existing == null) return Optional.empty();

        existing.setName(updated.getName());
        existing.setAictePermanentId(updated.getAictePermanentId());
        existing.setCurrentApplicationId(updated.getCurrentApplicationId());
        existing.setInstitutionType(updated.getInstitutionType());
        existing.setState(updated.getState());
        existing.setDistrict(updated.getDistrict());
        existing.setPincode(updated.getPincode());
        existing.setAddress(updated.getAddress());
        existing.setHeadName(updated.getHeadName());
        existing.setHeadDesignation(updated.getHeadDesignation());
        existing.setHeadEmail(updated.getHeadEmail());
        existing.setHeadPhone(updated.getHeadPhone());
        existing.setRegistrarEmail(updated.getRegistrarEmail());
        existing.setApprovalStatus(updated.getApprovalStatus());
        existing.setAdministrativeNotes(updated.getAdministrativeNotes());
        existing.setUpdatedAt(dataStore.now());

        dataStore.saveInstitution(existing);

        dataStore.addAuditEntry(
                "UPDATE", "INSTITUTION", id, userEmail, userRole,
                "Updated institution details for: " + existing.getName(),
                null, existing.getName()
        );

        return Optional.of(existing);
    }

    public Map<String, Object> getInstitutionDetailsWithHoldings(String id) {
        Institution inst = dataStore.institutions.get(id);
        if (inst == null) return null;

        Map<String, Object> map = new HashMap<>();
        map.put("institution", inst);

        List<FdrInstrument> instFdrs = dataStore.fdrInstruments.values().stream()
                .filter(f -> id.equals(f.getInstitutionId()))
                .collect(Collectors.toList());
        map.put("fdrs", instFdrs);
        map.put("totalDepositAmount", instFdrs.stream().mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0.0).sum());

        map.put("documents", dataStore.documents.values().stream()
                .filter(d -> id.equals(d.getInstitutionId()))
                .collect(Collectors.toList()));

        map.put("releaseCases", dataStore.releaseCases.values().stream()
                .filter(c -> id.equals(c.getInstitutionId()))
                .collect(Collectors.toList()));

        return map;
    }
}

package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.AuditTrailEntry;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuditService {

    private final DataStore dataStore;

    public AuditService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<AuditTrailEntry> getAuditTrail(String entityType, String entityId, String action, String user) {
        return dataStore.auditTrail.stream()
                .filter(a -> {
                    if (entityType != null && !entityType.isBlank() && !entityType.equalsIgnoreCase(a.getEntityType())) return false;
                    if (entityId != null && !entityId.isBlank() && !entityId.equalsIgnoreCase(a.getEntityId())) return false;
                    if (action != null && !action.isBlank() && !action.equalsIgnoreCase(a.getAction())) return false;
                    if (user != null && !user.isBlank() && !user.equalsIgnoreCase(a.getPerformedBy())) return false;
                    return true;
                })
                .collect(Collectors.toList());
    }
}

package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.MasterConfiguration;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class MasterDataService {

    private final DataStore dataStore;

    public MasterDataService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public MasterConfiguration getConfiguration() {
        return dataStore.configuration;
    }

    public MasterConfiguration updateConfiguration(MasterConfiguration updated, String userEmail, String userRole) {
        updated.setLastUpdated(dataStore.now());
        updated.setUpdatedBy(userEmail);
        dataStore.saveConfiguration(updated);

        dataStore.addAuditEntry(
                "CONFIG_UPDATE", "SYSTEM_CONFIG", "MASTER-CONFIG", userEmail, userRole,
                "Updated master configuration & reminder rules (Advance Days: " + updated.getAdvanceReminderDays() + ")",
                null, updated.getLastUpdated()
        );

        dataStore.recalculateAllStatuses();
        return updated;
    }

    public Map<String, Object> resetOfficialDataset() {
        return dataStore.wipeAndSeedOfficialOfficerData();
    }
}

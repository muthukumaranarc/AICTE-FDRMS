package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "master_configuration")
public class MasterConfiguration {
    @Id
    private String id = "MASTER-CONFIG";

    private List<Integer> advanceReminderDays = new ArrayList<>();
    private Integer escalationThresholdDays = 15;
    private Integer scrutinyDueDays = 14;
    private List<BankMaster> authorizedBanks = new ArrayList<>();
    private List<String> institutionCategories = new ArrayList<>();
    private List<String> instrumentTypes = new ArrayList<>();
    private List<String> documentTypes = new ArrayList<>();
    private String lastUpdated;
    private String updatedBy;

    public MasterConfiguration() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public List<Integer> getAdvanceReminderDays() { return advanceReminderDays; }
    public void setAdvanceReminderDays(List<Integer> advanceReminderDays) { this.advanceReminderDays = advanceReminderDays; }

    public Integer getEscalationThresholdDays() { return escalationThresholdDays; }
    public void setEscalationThresholdDays(Integer escalationThresholdDays) { this.escalationThresholdDays = escalationThresholdDays; }

    public Integer getScrutinyDueDays() { return scrutinyDueDays; }
    public void setScrutinyDueDays(Integer scrutinyDueDays) { this.scrutinyDueDays = scrutinyDueDays; }

    public List<BankMaster> getAuthorizedBanks() { return authorizedBanks; }
    public void setAuthorizedBanks(List<BankMaster> authorizedBanks) { this.authorizedBanks = authorizedBanks; }

    public List<String> getInstitutionCategories() { return institutionCategories; }
    public void setInstitutionCategories(List<String> institutionCategories) { this.institutionCategories = institutionCategories; }

    public List<String> getInstrumentTypes() { return instrumentTypes; }
    public void setInstrumentTypes(List<String> instrumentTypes) { this.instrumentTypes = instrumentTypes; }

    public List<String> getDocumentTypes() { return documentTypes; }
    public void setDocumentTypes(List<String> documentTypes) { this.documentTypes = documentTypes; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}

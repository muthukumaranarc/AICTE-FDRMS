package com.Muthu.AICTE_FDRMS.model;

public class BankMaster {
    private String id;
    private String bankName;
    private String bankCategory; // Public Sector, Private Scheduled, Foreign
    private String ifscPrefix;
    private Boolean active = true;

    public BankMaster() {}

    public BankMaster(String id, String bankName, String bankCategory, String ifscPrefix, Boolean active) {
        this.id = id;
        this.bankName = bankName;
        this.bankCategory = bankCategory;
        this.ifscPrefix = ifscPrefix;
        this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getBankCategory() { return bankCategory; }
    public void setBankCategory(String bankCategory) { this.bankCategory = bankCategory; }

    public String getIfscPrefix() { return ifscPrefix; }
    public void setIfscPrefix(String ifscPrefix) { this.ifscPrefix = ifscPrefix; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}

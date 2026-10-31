package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "institutions")
public class Institution {
    @Id
    private String id;

    @Indexed(unique = true)
    private String aictePermanentId;

    private String currentApplicationId;
    private String name;
    private String institutionType;
    private String state;
    private String district;
    private String pincode;
    private String address;
    private String headName;
    private String headDesignation;
    private String headEmail;
    private String headPhone;
    private String registrarEmail;
    private String approvalStatus;
    private String administrativeNotes;
    private String createdAt;
    private String updatedAt;

    public Institution() {}

    public Institution(String id, String aictePermanentId, String currentApplicationId, String name,
                       String institutionType, String state, String district, String pincode,
                       String address, String headName, String headDesignation, String headEmail,
                       String headPhone, String registrarEmail, String approvalStatus,
                       String administrativeNotes, String createdAt, String updatedAt) {
        this.id = id;
        this.aictePermanentId = aictePermanentId;
        this.currentApplicationId = currentApplicationId;
        this.name = name;
        this.institutionType = institutionType;
        this.state = state;
        this.district = district;
        this.pincode = pincode;
        this.address = address;
        this.headName = headName;
        this.headDesignation = headDesignation;
        this.headEmail = headEmail;
        this.headPhone = headPhone;
        this.registrarEmail = registrarEmail;
        this.approvalStatus = approvalStatus;
        this.administrativeNotes = administrativeNotes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAictePermanentId() { return aictePermanentId; }
    public void setAictePermanentId(String aictePermanentId) { this.aictePermanentId = aictePermanentId; }

    public String getCurrentApplicationId() { return currentApplicationId; }
    public void setCurrentApplicationId(String currentApplicationId) { this.currentApplicationId = currentApplicationId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getHeadName() { return headName; }
    public void setHeadName(String headName) { this.headName = headName; }

    public String getHeadDesignation() { return headDesignation; }
    public void setHeadDesignation(String headDesignation) { this.headDesignation = headDesignation; }

    public String getHeadEmail() { return headEmail; }
    public void setHeadEmail(String headEmail) { this.headEmail = headEmail; }

    public String getHeadPhone() { return headPhone; }
    public void setHeadPhone(String headPhone) { this.headPhone = headPhone; }

    public String getRegistrarEmail() { return registrarEmail; }
    public void setRegistrarEmail(String registrarEmail) { this.registrarEmail = registrarEmail; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getAdministrativeNotes() { return administrativeNotes; }
    public void setAdministrativeNotes(String administrativeNotes) { this.administrativeNotes = administrativeNotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}

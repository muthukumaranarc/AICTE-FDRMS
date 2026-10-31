package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class InternalUser {
    @Id
    private String id;

    private String name;
    private String designation;

    @Indexed(unique = true)
    private String email;

    @Indexed
    private UserRole role;

    private String bureau;
    private String phone;
    private String status = "ACTIVE"; // ACTIVE, INACTIVE
    private Integer assignedCasesCount = 0;

    public InternalUser() {}

    public InternalUser(String id, String name, String designation, String email,
                        UserRole role, String bureau, String phone, String status,
                        Integer assignedCasesCount) {
        this.id = id;
        this.name = name;
        this.designation = designation;
        this.email = email;
        this.role = role;
        this.bureau = bureau;
        this.phone = phone;
        this.status = status;
        this.assignedCasesCount = assignedCasesCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getBureau() { return bureau; }
    public void setBureau(String bureau) { this.bureau = bureau; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAssignedCasesCount() { return assignedCasesCount; }
    public void setAssignedCasesCount(Integer assignedCasesCount) { this.assignedCasesCount = assignedCasesCount; }
}

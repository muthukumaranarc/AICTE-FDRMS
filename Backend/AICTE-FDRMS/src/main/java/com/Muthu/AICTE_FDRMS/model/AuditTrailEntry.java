package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Document(collection = "audit_trail")
public class AuditTrailEntry {
    @Id
    private String id;

    @Indexed
    private String action; // CREATE, UPDATE, STATUS_CHANGE, DOCUMENT_UPLOAD, VERIFY, APPROVE, REJECT, ASSIGN, RENEWAL, RELEASE_RECORDED, CONFIG_UPDATE

    @Indexed
    private String entityType; // FDR, INSTITUTION, DOCUMENT, RELEASE_CASE, USER, SYSTEM_CONFIG

    @Indexed
    private String entityId;

    @Indexed
    private String performedBy;

    private String userRole;
    private String timestamp;
    private String details;
    private String beforeValue;
    private String afterValue;
    private String ipAddress = "127.0.0.1";

    // Cryptographic Tamper-Evidence Chaining
    private String previousHash;
    private String integrityHash;

    public AuditTrailEntry() {}

    public AuditTrailEntry(String id, String action, String entityType, String entityId,
                           String performedBy, String userRole, String timestamp, String details,
                           String beforeValue, String afterValue) {
        this.id = id;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.performedBy = performedBy;
        this.userRole = userRole;
        this.timestamp = timestamp;
        this.details = details;
        this.beforeValue = beforeValue;
        this.afterValue = afterValue;
        this.integrityHash = calculateHash();
    }

    public String calculateHash() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String payload = (id != null ? id : "") +
                    (action != null ? action : "") +
                    (entityType != null ? entityType : "") +
                    (entityId != null ? entityId : "") +
                    (performedBy != null ? performedBy : "") +
                    (timestamp != null ? timestamp : "") +
                    (details != null ? details : "") +
                    (previousHash != null ? previousHash : "GENESIS");
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "HASH_ERROR";
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getBeforeValue() { return beforeValue; }
    public void setBeforeValue(String beforeValue) { this.beforeValue = beforeValue; }

    public String getAfterValue() { return afterValue; }
    public void setAfterValue(String afterValue) { this.afterValue = afterValue; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) {
        this.previousHash = previousHash;
        this.integrityHash = calculateHash();
    }

    public String getIntegrityHash() { return integrityHash; }
    public void setIntegrityHash(String integrityHash) { this.integrityHash = integrityHash; }
}

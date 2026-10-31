package com.Muthu.AICTE_FDRMS.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    @Indexed
    private String category; // MATURITY, RENEWAL, VERIFICATION, APPROVAL, DISCREPANCY, ESCALATION, COMPLIANCE

    private String title;
    private String message;
    private String severity; // URGENT, WARNING, INFO

    @Indexed
    private String targetRole; // ROLE_REVIEWER, ROLE_APPROVER, ROLE_ADMIN, ALL

    @Indexed
    private String targetUser;

    private String relatedEntityType; // FDR, INSTITUTION, RELEASE_CASE
    private String relatedEntityId;
    private Boolean isRead = false;
    private String createdAt;

    public Notification() {}

    public Notification(String id, String category, String title, String message, String severity,
                        String targetRole, String targetUser, String relatedEntityType,
                        String relatedEntityId, Boolean isRead, String createdAt) {
        this.id = id;
        this.category = category;
        this.title = title;
        this.message = message;
        this.severity = severity;
        this.targetRole = targetRole;
        this.targetUser = targetUser;
        this.relatedEntityType = relatedEntityType;
        this.relatedEntityId = relatedEntityId;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getTargetUser() { return targetUser; }
    public void setTargetUser(String targetUser) { this.targetUser = targetUser; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationMongoRepository extends MongoRepository<Notification, String> {
    List<Notification> findByTargetRole(String targetRole);
    List<Notification> findByTargetUser(String targetUser);
    List<Notification> findByIsRead(Boolean isRead);
}

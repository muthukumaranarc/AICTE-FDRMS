package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.AuditTrailEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditTrailMongoRepository extends MongoRepository<AuditTrailEntry, String> {
    List<AuditTrailEntry> findByEntityType(String entityType);
    List<AuditTrailEntry> findByEntityId(String entityId);
    List<AuditTrailEntry> findByPerformedBy(String performedBy);
    Optional<AuditTrailEntry> findTopByOrderByTimestampDesc();
}

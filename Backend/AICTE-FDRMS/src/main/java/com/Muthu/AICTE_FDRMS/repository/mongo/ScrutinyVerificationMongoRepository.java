package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.ScrutinyVerificationRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScrutinyVerificationMongoRepository extends MongoRepository<ScrutinyVerificationRecord, String> {
    List<ScrutinyVerificationRecord> findByFdrId(String fdrId);
    List<ScrutinyVerificationRecord> findByInstitutionId(String institutionId);
}

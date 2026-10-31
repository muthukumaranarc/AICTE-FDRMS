package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.DocumentRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentMongoRepository extends MongoRepository<DocumentRecord, String> {
    List<DocumentRecord> findByFdrId(String fdrId);
    List<DocumentRecord> findByInstitutionId(String institutionId);
    List<DocumentRecord> findByCaseId(String caseId);
}

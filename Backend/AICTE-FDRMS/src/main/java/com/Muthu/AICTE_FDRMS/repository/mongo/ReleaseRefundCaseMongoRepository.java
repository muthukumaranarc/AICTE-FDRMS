package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.CaseStatus;
import com.Muthu.AICTE_FDRMS.model.ReleaseRefundCase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReleaseRefundCaseMongoRepository extends MongoRepository<ReleaseRefundCase, String> {
    List<ReleaseRefundCase> findByInstitutionId(String institutionId);
    List<ReleaseRefundCase> findByFdrId(String fdrId);
    List<ReleaseRefundCase> findByCaseStatus(CaseStatus caseStatus);
}

package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.ScrutinyObservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScrutinyObservationMongoRepository extends MongoRepository<ScrutinyObservation, String> {
    List<ScrutinyObservation> findByFdrId(String fdrId);
    List<ScrutinyObservation> findByInstitutionId(String institutionId);
}

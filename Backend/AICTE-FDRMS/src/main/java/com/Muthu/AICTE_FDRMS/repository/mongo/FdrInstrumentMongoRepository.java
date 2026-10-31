package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.FdrInstrument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FdrInstrumentMongoRepository extends MongoRepository<FdrInstrument, String> {
    Optional<FdrInstrument> findByFdrNumber(String fdrNumber);
    List<FdrInstrument> findByInstitutionId(String institutionId);
}

package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.Institution;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionMongoRepository extends MongoRepository<Institution, String> {
    Optional<Institution> findByAictePermanentId(String aictePermanentId);
}

package com.Muthu.AICTE_FDRMS.repository.mongo;

import com.Muthu.AICTE_FDRMS.model.InternalUser;
import com.Muthu.AICTE_FDRMS.model.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternalUserMongoRepository extends MongoRepository<InternalUser, String> {
    Optional<InternalUser> findByEmail(String email);
    List<InternalUser> findByRole(UserRole role);
}

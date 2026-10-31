package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.InternalUser;
import com.Muthu.AICTE_FDRMS.model.UserRole;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final DataStore dataStore;

    public UserService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<InternalUser> getAllUsers() {
        return new ArrayList<>(dataStore.users.values());
    }

    public Optional<InternalUser> getUserById(String id) {
        return Optional.ofNullable(dataStore.users.get(id));
    }

    public InternalUser createUser(InternalUser user, String performedBy, String userRole) {
        String id = "USR-" + String.format("%03d", dataStore.users.size() + 1);
        user.setId(id);
        if (user.getStatus() == null) user.setStatus("ACTIVE");
        dataStore.saveUser(user);

        dataStore.addAuditEntry(
                "CREATE", "USER", id, performedBy, userRole,
                "Created internal user account: " + user.getName() + " (" + user.getRole() + ")",
                null, user.getEmail()
        );
        return user;
    }

    public Optional<InternalUser> updateUser(String id, InternalUser updated, String performedBy, String userRole) {
        InternalUser existing = dataStore.users.get(id);
        if (existing == null) return Optional.empty();

        existing.setName(updated.getName());
        existing.setDesignation(updated.getDesignation());
        existing.setEmail(updated.getEmail());
        existing.setRole(updated.getRole());
        existing.setBureau(updated.getBureau());
        existing.setPhone(updated.getPhone());
        existing.setStatus(updated.getStatus());

        dataStore.saveUser(existing);

        dataStore.addAuditEntry(
                "UPDATE", "USER", id, performedBy, userRole,
                "Updated user details for: " + existing.getName(),
                null, existing.getRole().toString()
        );
        return Optional.of(existing);
    }
}

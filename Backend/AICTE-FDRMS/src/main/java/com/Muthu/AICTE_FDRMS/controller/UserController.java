package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.model.InternalUser;
import com.Muthu.AICTE_FDRMS.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<InternalUser>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternalUser> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InternalUser> createUser(
            @RequestBody InternalUser user,
            @RequestHeader(value = "X-User-Email", defaultValue = "patel.v@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_ADMIN") String userRole) {
        return ResponseEntity.ok(userService.createUser(user, userEmail, userRole));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InternalUser> updateUser(
            @PathVariable String id,
            @RequestBody InternalUser user,
            @RequestHeader(value = "X-User-Email", defaultValue = "patel.v@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_ADMIN") String userRole) {
        return userService.updateUser(id, user, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.Muthu.AICTE_FDRMS.controller;

import com.Muthu.AICTE_FDRMS.model.Notification;
import com.Muthu.AICTE_FDRMS.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(notificationService.getNotifications(userEmail, userRole, category));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userEmail, userRole)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "X-User-Email", defaultValue = "sen.a@aicte-india.org") String userEmail,
            @RequestHeader(value = "X-User-Role", defaultValue = "ROLE_REVIEWER") String userRole) {
        notificationService.markAllAsRead(userEmail, userRole);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> dismissNotification(@PathVariable String id) {
        notificationService.dismissNotification(id);
        return ResponseEntity.ok().build();
    }
}

package com.Muthu.AICTE_FDRMS.service;

import com.Muthu.AICTE_FDRMS.model.Notification;
import com.Muthu.AICTE_FDRMS.repository.DataStore;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final DataStore dataStore;

    public NotificationService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<Notification> getNotifications(String userEmail, String userRole, String category) {
        return dataStore.notifications.stream()
                .filter(n -> {
                    if (category != null && !category.isBlank() && !category.equalsIgnoreCase(n.getCategory())) return false;
                    if (userRole != null && !userRole.isBlank()) {
                        if (!"ALL".equalsIgnoreCase(n.getTargetRole()) && !userRole.equalsIgnoreCase(n.getTargetRole())) {
                            if (userEmail == null || !userEmail.equalsIgnoreCase(n.getTargetUser())) {
                                return false;
                            }
                        }
                    }
                    return true;
                })
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail, String userRole) {
        return getNotifications(userEmail, userRole, null).stream()
                .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                .count();
    }

    public void markAsRead(String notifId) {
        for (Notification n : dataStore.notifications) {
            if (n.getId().equals(notifId)) {
                n.setIsRead(true);
                dataStore.saveNotification(n);
                break;
            }
        }
    }

    public void markAllAsRead(String userEmail, String userRole) {
        List<Notification> list = getNotifications(userEmail, userRole, null);
        for (Notification n : list) {
            n.setIsRead(true);
            dataStore.saveNotification(n);
        }
    }

    public void dismissNotification(String notifId) {
        dataStore.notifications.removeIf(n -> n.getId().equals(notifId));
    }
}

package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{email}")
    public List<Notification> getNotifications(@PathVariable String email) {
        return notificationService.getNotificationsByUser(email);
    }

    @GetMapping("/user/{email}/unread-count")
    public Map<String, Long> getUnreadCount(@PathVariable String email) {
        return Map.of("count", notificationService.getUnreadCount(email));
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
    }

    @PatchMapping("/user/{email}/read-all")
    public void markAllAsRead(@PathVariable String email) {
        notificationService.markAllAsRead(email);
    }
}

package com.smartcampus.controller;

import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam String userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@RequestParam String userId) {
        long unreadCount = notificationService.getUnreadCountByUserId(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", unreadCount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam String userId) {
        List<Notification> notifications = notificationService.getUnreadNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        return notificationService.markAsRead(notificationId)
                .map(notification -> ResponseEntity.ok((Object) notification))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestParam String userId) {
        notificationService.markAllAsRead(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteAllNotifications(@RequestParam String userId) {
        notificationService.deleteNotificationsByUserId(userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications deleted successfully");
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
}

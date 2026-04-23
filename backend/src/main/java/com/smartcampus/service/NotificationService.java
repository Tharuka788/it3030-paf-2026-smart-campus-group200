package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(String email, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUserEmail(email);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByUser(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        unread.forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndIsReadFalse(email);
    }
}

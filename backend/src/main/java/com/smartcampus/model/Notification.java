package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    private String id;
    private String userId; // Email of the user receiving notification
    private String notificationType; // BOOKING_APPROVED, BOOKING_REJECTED, TICKET_STATUS_CHANGED, TICKET_COMMENTED, SYSTEM_ALERT
    private String relatedResourceId; // Booking ID or Ticket ID
    private String relatedResourceType; // BOOKING or TICKET
    private String title;
    private String message;
    private boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime readAt;
}

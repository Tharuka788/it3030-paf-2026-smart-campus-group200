package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id
    private String id;
    private String userEmail;
    private String userName;
    private String subject;
    private String category; // IT Support, Maintenance, Administration
    private String priority; // HIGH, MEDIUM, LOW
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private String description;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Data model for a booking.
 * Represented as a document in the MongoDB "bookings" collection.
 */
@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    // Unique ID for the booking (assigned by MongoDB)
    @Id
    private String id;

    // ID of the resource being booked (e.g., Facility ID)
    private String resourceId;

    // Name of the resource being booked
    private String resourceName;

    // Email of the person who created the booking
    private String userEmail;

    // Name of the person who created the booking
    private String userName;

    // Time when the resource usage starts
    private LocalDateTime startTime;

    // Time when the resource usage ends
    private LocalDateTime endTime;

    // Reason for the booking
    private String purpose;

    // Number of attendees expected
    private Integer expectedAttendees;

    // List of selected seats or workstations (optional)
    private java.util.List<String> selectedSeats;

    // Current status of the booking (e.g., PENDING, APPROVED, REJECTED, CANCELLED)
    private String status;

    // Physical location of the resource
    private String location;

    // Reason for rejection (if the booking was rejected by an admin)
    private String rejectionReason;

    // Timestamp when the booking was created
    private LocalDateTime createdAt = LocalDateTime.now();

    // Timestamp when the booking was last updated
    private LocalDateTime updatedAt = LocalDateTime.now();
}

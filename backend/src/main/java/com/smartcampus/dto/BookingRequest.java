package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) for creating a new booking.
 * This class captures the details sent from the frontend booking form.
 */
@Data
public class BookingRequest {
    // The email of the person making the booking
    @Email(message = "Email should be valid")
    @NotBlank(message = "User email is required")
    private String userEmail;

    // Full name of the user
    @NotBlank(message = "User name is required")
    private String userName;

    // Unique identifier for the resource (Lab, Hall, Equipment)
    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    // Display name of the resource
    private String resourceName;
    
    // Physical location of the resource
    private String location;

    // When the booking starts
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    // When the booking ends
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    // Reason for the booking (e.g., Exam, Workshop)
    @NotBlank(message = "Purpose is required")
    private String purpose;

    // Number of people expected to attend
    @NotNull(message = "Expected attendees count is required")
    private Integer expectedAttendees;

    // List of specific seat/workstation numbers selected (for visual bookings)
    private java.util.List<String> selectedSeats;
}

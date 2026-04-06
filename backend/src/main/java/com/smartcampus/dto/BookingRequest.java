package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {
    @Email(message = "Email should be valid")
    @NotBlank(message = "User email is required")
    private String userEmail;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;
}

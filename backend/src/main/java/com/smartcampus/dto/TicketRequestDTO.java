package com.smartcampus.dto;

import com.smartcampus.model.enums.Impact;
import com.smartcampus.model.enums.Priority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequestDTO {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Detailed description is required")
    private String detailedDescription;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "Department name is required")
    private String departmentName;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid format")
    private String email;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Subcategory is required")
    private String subcategory;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "Impact is required")
    private Impact impact;
}

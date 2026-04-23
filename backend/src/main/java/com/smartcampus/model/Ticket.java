package com.smartcampus.model;

import com.smartcampus.model.enums.Impact;
import com.smartcampus.model.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id
    private String id;
    
    private String subject;
    private String detailedDescription;
    
    private String userName;
    private String departmentName;
    private String contactNumber;
    private String email;
    
    private String category;
    private String subcategory;
    
    private Priority priority;
    private Impact impact;
    
    private String status = "Open";
    
    private List<String> attachmentPaths = new ArrayList<>();
    
    private String adminComments;
    private String assignedTo;
    private String notesForTechnician;
    private String notesFromTechnician;

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

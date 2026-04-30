package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponseDTO {
    private String message;
    private Ticket ticket;
}

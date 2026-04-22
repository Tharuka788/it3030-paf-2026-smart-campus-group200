package com.smartcampus.controller;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(value = "/admin/tickets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponseDTO> createTicket(
            @ModelAttribute @Valid TicketRequestDTO ticketDTO,
            @RequestParam(value = "files", required = false) MultipartFile[] files) throws IOException {
        
        Ticket savedTicket = ticketService.saveTicketWithFiles(ticketDTO, files);
        
        TicketResponseDTO response = new TicketResponseDTO("Ticket created successfully", savedTicket);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Keep v1 endpoint for potential existing usage, but we'll point it to the new logic if needed
    // However, the prompt specifically asked for the admin one.
    
    @GetMapping("/v1/tickets")
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/v1/tickets/user/{email:.+}")
    public List<Ticket> getTicketsByUser(@PathVariable String email) {
        return ticketService.getTicketsByUser(email.toLowerCase());
    }

    @PatchMapping("/v1/tickets/{id}/status")
    public Ticket updateStatus(@PathVariable String id, @RequestParam String status) {
        return ticketService.updateTicketStatus(id, status);
    }
}

package com.smartcampus.service;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public Ticket createTicket(Ticket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("OPEN");
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByUser(String email) {
        return ticketRepository.findByEmail(email);
    }

    public Optional<Ticket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }

    public Ticket updateTicketStatus(String id, String status, String adminComments) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            if (adminComments != null) {
                ticket.setAdminComments(adminComments);
            }
            // Updating manual time if auditing somehow fails, but auditing should handle it
            ticket.setUpdatedAt(LocalDateTime.now());
            Ticket updated = ticketRepository.save(ticket);
            
            // Create notification
            String title = "Ticket Update: " + status;
            String message = String.format("Your ticket regarding '%s' has been updated to %s.", 
                ticket.getSubject(), status.toLowerCase());
            notificationService.createNotification(ticket.getUserEmail(), title, message, "TICKET");
            
            return updated;
        }).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public void deleteTicket(String id) {
        ticketRepository.findById(id).ifPresent(ticket -> {
            // Delete associated files
            if (ticket.getAttachmentPaths() != null) {
                for (String filePathStr : ticket.getAttachmentPaths()) {
                    try {
                        Path filePath = Paths.get(filePathStr);
                        Files.deleteIfExists(filePath);
                    } catch (IOException e) {
                        System.err.println("Failed to delete file: " + filePathStr + " - " + e.getMessage());
                    }
                }
            }
            // Delete record
            ticketRepository.deleteById(id);
        });
    }
}

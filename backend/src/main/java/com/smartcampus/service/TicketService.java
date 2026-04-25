package com.smartcampus.service;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final String uploadDir = "uploads/tickets";

    public Ticket createTicket(Ticket ticket) {
        log.info("Creating new ticket with subject: '{}' for user: {}", ticket.getSubject(), ticket.getEmail());
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("OPEN");
        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket created successfully with ID: {}", savedTicket.getId());
        
        try {
            emailService.sendTicketCreation(savedTicket);
        } catch (Exception e) {
            log.error("Failed to send ticket creation email for ticket {}", savedTicket.getId(), e);
        }
        
        return savedTicket;
    }

    public Ticket saveTicketWithFiles(TicketRequestDTO dto, MultipartFile[] files) throws IOException {
        log.info("Creating ticket with files for user: {} | Subject: '{}' | Category: {}",
                dto.getEmail(), dto.getSubject(), dto.getCategory());

        Ticket ticket = new Ticket();
        ticket.setSubject(dto.getSubject());
        ticket.setDetailedDescription(dto.getDetailedDescription());
        ticket.setUserName(dto.getUserName());
        ticket.setDepartmentName(dto.getDepartmentName());
        ticket.setContactNumber(dto.getContactNumber());
        ticket.setEmail(dto.getEmail());
        ticket.setCategory(dto.getCategory());
        ticket.setSubcategory(dto.getSubcategory());
        ticket.setPriority(dto.getPriority());
        ticket.setImpact(dto.getImpact());
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        if (files != null && files.length > 0) {
            log.debug("Processing {} file attachment(s) for ticket", files.length);
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.debug("Created upload directory: {}", uploadPath.toAbsolutePath());
            }

            List<String> attachmentPaths = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);
                    attachmentPaths.add(filePath.toString());
                    log.debug("File uploaded: {} ({} bytes)", fileName, file.getSize());
                }
            }
            ticket.setAttachmentPaths(attachmentPaths);
            log.info("Attached {} file(s) to ticket", attachmentPaths.size());
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket created successfully with ID: {} | Priority: {} | Impact: {}",
                savedTicket.getId(), savedTicket.getPriority(), savedTicket.getImpact());
        
        try {
            emailService.sendTicketCreation(savedTicket);
        } catch (Exception e) {
            log.error("Failed to send ticket creation email for ticket {}", savedTicket.getId(), e);
        }
        
        return savedTicket;
    }

    public List<Ticket> getAllTickets() {
        log.debug("Fetching all tickets");
        List<Ticket> tickets = ticketRepository.findAll();
        log.debug("Retrieved {} tickets", tickets.size());
        return tickets;
    }

    public List<Ticket> getTicketsByUser(String email) {
        log.debug("Fetching tickets for user: {}", email);
        List<Ticket> tickets = ticketRepository.findByEmail(email);
        log.debug("Found {} tickets for user: {}", tickets.size(), email);
        return tickets;
    }

    public Optional<Ticket> getTicketById(String id) {
        log.debug("Fetching ticket by ID: {}", id);
        return ticketRepository.findById(id);
    }

    public Ticket updateTicketStatus(String id, String status, String adminComments, String technicianFeedback, String assignedTo, String notesForTechnician, String notesFromTechnician) {
        return ticketRepository.findById(id).map(ticket -> {
            String previousStatus = ticket.getStatus();
            ticket.setStatus(status);
            if (adminComments != null) {
                ticket.setAdminComments(adminComments);
            }
            if (technicianFeedback != null) {
                ticket.setTechnicianFeedback(technicianFeedback);
            }
            if (assignedTo != null) {
                ticket.setAssignedTo(assignedTo);
            }
            if (notesForTechnician != null) {
                ticket.setNotesForTechnician(notesForTechnician);
            }
            if (notesFromTechnician != null) {
                ticket.setNotesFromTechnician(notesFromTechnician);
            }
            ticket.setUpdatedAt(LocalDateTime.now());
            Ticket updated = ticketRepository.save(ticket);
            log.info("Ticket {} status changed: {} → {} | User: {}",
                    id, previousStatus, status, ticket.getEmail());

            // Create notification
            String title = "Ticket Update: " + status;
            String message = String.format("Your ticket regarding '%s' has been updated to %s.",
                    ticket.getSubject(), status.toLowerCase());
            notificationService.createNotification(ticket.getEmail(), "TICKET_STATUS_CHANGED", title, message,
                    ticket.getId(), "TICKET");
                    
            try {
                emailService.sendTicketStatusUpdate(updated);
            } catch (Exception e) {
                log.error("Failed to send ticket status update email for ticket {}", updated.getId(), e);
            }

            return updated;
        }).orElseThrow(() -> {
            log.error("Ticket not found with ID: {}", id);
            return new RuntimeException("Ticket not found");
        });
    }

    public void deleteTicket(String id) {
        log.info("Deleting ticket with ID: {}", id);
        ticketRepository.findById(id).ifPresent(ticket -> {
            // Delete associated files
            if (ticket.getAttachmentPaths() != null) {
                log.debug("Cleaning up {} attachment(s) for ticket: {}", ticket.getAttachmentPaths().size(), id);
                for (String filePathStr : ticket.getAttachmentPaths()) {
                    try {
                        Path filePath = Paths.get(filePathStr);
                        Files.deleteIfExists(filePath);
                        log.debug("Deleted attachment: {}", filePathStr);
                    } catch (IOException e) {
                        log.error("Failed to delete attachment file: {} - {}", filePathStr, e.getMessage());
                    }
                }
            }
            // Delete record
            ticketRepository.deleteById(id);
            log.info("Ticket {} deleted successfully | Subject: '{}' | User: {}",
                    id, ticket.getSubject(), ticket.getEmail());
        });
    }
}

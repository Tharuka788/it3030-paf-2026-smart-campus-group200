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
    private final String uploadDir = "uploads/tickets";

    public Ticket createTicket(Ticket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("OPEN");
        return ticketRepository.save(ticket);
    }

    public Ticket saveTicketWithFiles(TicketRequestDTO dto, MultipartFile[] files) throws IOException {
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
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            List<String> attachmentPaths = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);
                    attachmentPaths.add(filePath.toString());
                }
            }
            ticket.setAttachmentPaths(attachmentPaths);
        }

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

    public Ticket updateTicketStatus(String id, String status, String adminComments, String assignedTo, String technicianNotes) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            if (adminComments != null) {
                ticket.setAdminComments(adminComments);
            }
            if (assignedTo != null) {
                ticket.setAssignedTo(assignedTo);
            }
            if (technicianNotes != null) {
                ticket.setTechnicianNotes(technicianNotes);
            }
            ticket.setUpdatedAt(LocalDateTime.now());
            Ticket updated = ticketRepository.save(ticket);
            
            // Create notification
            String title = "Ticket Update: " + status;
            String message = String.format("Your ticket regarding '%s' has been updated to %s.", 
                ticket.getSubject(), status.toLowerCase());
            notificationService.createNotification(ticket.getEmail(), title, message, "TICKET");
            
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

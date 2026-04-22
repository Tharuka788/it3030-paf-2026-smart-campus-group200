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
    private final String UPLOAD_DIR = "uploads/";

    public Ticket saveTicketWithFiles(TicketRequestDTO dto, MultipartFile[] files) throws IOException {
        List<String> filePaths = new ArrayList<>();
        
        if (files != null && files.length > 0) {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(file.getInputStream(), filePath);
                    filePaths.add(filePath.toString());
                }
            }
        }

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
        ticket.setAttachmentPaths(filePaths);
        ticket.setStatus("Open");

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
            return ticketRepository.save(ticket);
        }).orElseThrow(() -> new RuntimeException("Ticket not found"));
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

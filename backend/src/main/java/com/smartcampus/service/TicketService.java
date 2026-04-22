package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EmailService emailService;

    public Ticket createTicket(Ticket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus("OPEN");
        Ticket savedTicket = ticketRepository.save(ticket);
        
        emailService.sendTicketCreation(savedTicket);
        return savedTicket;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByUser(String userEmail) {
        return ticketRepository.findByUserEmail(userEmail);
    }

    public Optional<Ticket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }

    public Ticket updateTicketStatus(String id, String status) {
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            ticket.setUpdatedAt(LocalDateTime.now());
            Ticket savedTicket = ticketRepository.save(ticket);
            
            emailService.sendTicketStatusUpdate(savedTicket);
            return savedTicket;
        }).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }
}

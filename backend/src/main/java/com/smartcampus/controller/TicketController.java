package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/user/{userEmail:.+}")
    public List<Ticket> getTicketsByUser(@PathVariable String userEmail) {
        return ticketService.getTicketsByUser(userEmail.toLowerCase());
    }

    @PatchMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable String id, @RequestParam String status) {
        return ticketService.updateTicketStatus(id, status);
    }
}

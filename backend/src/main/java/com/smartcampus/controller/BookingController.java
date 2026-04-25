package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for handling all booking-related API requests.
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create a new booking request.
     * Validates input using the BookingRequest DTO.
     */
    @PostMapping()
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        Booking booking = new Booking();
        booking.setUserEmail(bookingRequest.getUserEmail().toLowerCase());
        booking.setUserName(bookingRequest.getUserName());
        booking.setResourceId(bookingRequest.getResourceId());
        booking.setResourceName(bookingRequest.getResourceName());
        booking.setStartTime(bookingRequest.getStartTime());
        booking.setEndTime(bookingRequest.getEndTime());
        booking.setPurpose(bookingRequest.getPurpose());
        booking.setExpectedAttendees(bookingRequest.getExpectedAttendees());
        booking.setSelectedSeats(bookingRequest.getSelectedSeats());
        booking.setLocation(bookingRequest.getLocation());
        return new ResponseEntity<>(bookingService.createBooking(booking), HttpStatus.CREATED);
    }

    /**
     * Update an existing booking.
     * Re-validates time conflicts and sets status to PENDING for re-approval.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable String id, @Valid @RequestBody BookingRequest bookingRequest) {
        Booking booking = new Booking();
        booking.setResourceId(bookingRequest.getResourceId());
        booking.setStartTime(bookingRequest.getStartTime());
        booking.setEndTime(bookingRequest.getEndTime());
        booking.setPurpose(bookingRequest.getPurpose());
        booking.setExpectedAttendees(bookingRequest.getExpectedAttendees());
        booking.setSelectedSeats(bookingRequest.getSelectedSeats());
        return ResponseEntity.ok(bookingService.updateBooking(id, booking));
    }

    /**
     * Get a list of all bookings in the system.
     * Used by administrators.
     */
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    /**
     * Get all bookings for a specific user by their email.
     */
    @GetMapping("/user/{userEmail:.+}")
    public List<Booking> getBookingsByUser(@PathVariable String userEmail) {
        return bookingService.getBookingsByUser(userEmail.toLowerCase());
    }

    /**
     * Get details of a single booking by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update the status of a booking (e.g., APPROVED, REJECTED, CANCELLED).
     */
    @PatchMapping("/{id}/status")
    public Booking updateBookingStatus(
            @PathVariable String id, 
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        return bookingService.updateBookingStatus(id, status, reason);
    }

    /**
     * Delete a booking from the system.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
    }

    /**
     * Get all active bookings for a specific resource (e.g., a Lab or Hall).
     * Used to check for availability conflicts.
     */
    @GetMapping("/resource/{resourceId}")
    public List<Booking> getBookingsByResource(@PathVariable String resourceId) {
        return bookingService.getBookingsByResource(resourceId);
    }

    /**
     * Handles validation errors and returns a simple message to the frontend.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
    }
}

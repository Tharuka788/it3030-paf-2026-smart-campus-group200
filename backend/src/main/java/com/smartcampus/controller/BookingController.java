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

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping()
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        Booking booking = new Booking();
        booking.setUserEmail(bookingRequest.getUserEmail());
        booking.setUserName(bookingRequest.getUserName());
        booking.setResourceId(bookingRequest.getResourceId());
        booking.setStartTime(bookingRequest.getStartTime());
        booking.setEndTime(bookingRequest.getEndTime());
        booking.setPurpose(bookingRequest.getPurpose());
        booking.setExpectedAttendees(bookingRequest.getExpectedAttendees());
        return new ResponseEntity<>(bookingService.createBooking(booking), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/user/{userEmail}")
    public List<Booking> getBookingsByUser(@PathVariable String userEmail) {
        return bookingService.getBookingsByUser(userEmail);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public Booking updateBookingStatus(@PathVariable String id, @RequestParam String status) {
        return bookingService.updateBookingStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
    }
}

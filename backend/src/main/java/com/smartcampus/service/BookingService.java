package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByUser(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail);
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public Booking updateBookingStatus(String id, String status) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus(status);
            booking.setUpdatedAt(LocalDateTime.now());
            return bookingRepository.save(booking);
        }).orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public void deleteBooking(String id) {
        bookingRepository.deleteById(id);
    }
}

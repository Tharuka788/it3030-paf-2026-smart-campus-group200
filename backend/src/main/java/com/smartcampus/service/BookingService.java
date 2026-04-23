package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    private void populateResourceName(Booking booking) {
        if (booking.getResourceId() != null && (booking.getResourceName() == null || booking.getResourceName().isEmpty())) {
            facilityRepository.findById(booking.getResourceId())
                    .ifPresent(f -> booking.setResourceName(f.getName()));
        }
    }

    public Booking createBooking(Booking booking) {
        if (booking.getResourceId() == null) {
            throw new IllegalArgumentException("Resource ID is required for booking");
        }
        // Validate overlaps
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndStatusIn(
                booking.getResourceId(), Arrays.asList("PENDING", "APPROVED"));

        for (Booking existing : existingBookings) {
            LocalDateTime existingStart = existing.getStartTime();
            LocalDateTime existingEnd = existing.getEndTime();
            
            if (existingStart == null || existingEnd == null || booking.getStartTime() == null || booking.getEndTime() == null) {
                continue; // Skip invalid bookings
            }
            
            // 30 min buffer
            LocalDateTime bufferStart = existingStart.minusMinutes(30);
            LocalDateTime bufferEnd = existingEnd.plusMinutes(30);

            if (booking.getStartTime().isBefore(bufferEnd) && booking.getEndTime().isAfter(bufferStart)) {
                // If both bookings have selected seats, check for intersection
                if (booking.getSelectedSeats() != null && !booking.getSelectedSeats().isEmpty() &&
                    existing.getSelectedSeats() != null && !existing.getSelectedSeats().isEmpty()) {
                    
                    boolean hasCommonSeat = booking.getSelectedSeats().stream()
                            .anyMatch(existing.getSelectedSeats()::contains);
                    
                    if (hasCommonSeat) {
                        throw new IllegalArgumentException("One or more selected seats are already booked for this time.");
                    }
                } else {
                    // If either is a "whole hall" booking, then it's a conflict
                    throw new IllegalArgumentException("Booking conflicts with an existing schedule (including 30-min buffer). Please select another time.");
                }
            }
        }

        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        bookings.forEach(this::populateResourceName);
        return bookings;
    }

    public List<Booking> getBookingsByUser(String userEmail) {
        List<Booking> bookings = bookingRepository.findByUserEmail(userEmail);
        bookings.forEach(this::populateResourceName);
        return bookings;
    }

    public Optional<Booking> getBookingById(String id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        booking.ifPresent(this::populateResourceName);
        return booking;
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

    public List<Booking> getBookingsByResource(String resourceId) {
        if (resourceId == null || resourceId.isEmpty() || resourceId.equals("null") || resourceId.equals("undefined")) {
            return Arrays.asList();
        }
        return bookingRepository.findByResourceIdAndStatusIn(resourceId, Arrays.asList("PENDING", "APPROVED"));
    }
}

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
    private final EmailService emailService;
    private final NotificationService notificationService;

    private void populateResourceName(Booking booking) {
        if (booking.getResourceName() == null || booking.getResourceName().isEmpty()) {
            facilityRepository.findById(booking.getResourceId())
                    .ifPresent(f -> booking.setResourceName(f.getName()));
        }
    }

    public Booking createBooking(Booking booking) {
        // Validate overlaps
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndStatusIn(
                booking.getResourceId(), Arrays.asList("PENDING", "APPROVED"));

        for (Booking existing : existingBookings) {
            LocalDateTime existingStart = existing.getStartTime();
            LocalDateTime existingEnd = existing.getEndTime();
            
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
        Booking savedBooking = bookingRepository.save(booking);
        
        // Populate resource name before sending email if it's missing
        populateResourceName(savedBooking);
        emailService.sendBookingConfirmation(savedBooking);
        
        // Create notification for the user about their new booking submission
        notificationService.createNotification(
                savedBooking.getUserEmail(),
                "BOOKING_CREATED",
                "Booking Submitted",
                "Your booking for " + (savedBooking.getResourceName() != null ? savedBooking.getResourceName() : "a resource") 
                        + " on " + savedBooking.getStartTime().toLocalDate() 
                        + " from " + savedBooking.getStartTime().toLocalTime() 
                        + " to " + savedBooking.getEndTime().toLocalTime() 
                        + " is pending approval.",
                savedBooking.getId(),
                "BOOKING"
        );
        
        return savedBooking;
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
            Booking savedBooking = bookingRepository.save(booking);
            
            if ("CANCELLED".equalsIgnoreCase(status)) {
                populateResourceName(savedBooking);
                emailService.sendBookingCancellation(savedBooking);
                notificationService.createNotification(
                        savedBooking.getUserEmail(),
                        "BOOKING_CANCELLED",
                        "Booking Cancelled",
                        "Your booking for " + (savedBooking.getResourceName() != null ? savedBooking.getResourceName() : "a resource") + " has been cancelled.",
                        savedBooking.getId(),
                        "BOOKING"
                );
            }
            
            // Send notifications for booking status changes
            if ("APPROVED".equalsIgnoreCase(status)) {
                notificationService.createNotification(
                        savedBooking.getUserEmail(),
                        "BOOKING_APPROVED",
                        "Booking Approved",
                        "Your booking for " + savedBooking.getResourceName() + " has been approved.",
                        savedBooking.getId(),
                        "BOOKING"
                );
            } else if ("REJECTED".equalsIgnoreCase(status)) {
                notificationService.createNotification(
                        savedBooking.getUserEmail(),
                        "BOOKING_REJECTED",
                        "Booking Rejected",
                        "Your booking for " + savedBooking.getResourceName() + " has been rejected. Reason: " + (savedBooking.getRejectionReason() != null ? savedBooking.getRejectionReason() : "No reason provided"),
                        savedBooking.getId(),
                        "BOOKING"
                );
            }
            
            return savedBooking;
        }).orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public void deleteBooking(String id) {
        bookingRepository.findById(id).ifPresent(booking -> {
            populateResourceName(booking);
            emailService.sendBookingCancellation(booking);
            bookingRepository.deleteById(id);
        });
    }

    public List<Booking> getBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceIdAndStatusIn(resourceId, Arrays.asList("PENDING", "APPROVED"));
    }
}

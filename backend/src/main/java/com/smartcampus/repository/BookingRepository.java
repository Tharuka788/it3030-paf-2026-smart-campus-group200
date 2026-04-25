package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Booking entities.
 * Provides methods for database operations on the bookings collection.
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    // Find all bookings made by a specific user email
    List<Booking> findByUserEmail(String userEmail);
    
    // Find all bookings with a specific status (e.g., PENDING)
    List<Booking> findByStatus(String status);
    
    // Find bookings for a resource that are currently active (PENDING or APPROVED)
    // Used to detect scheduling overlaps.
    List<Booking> findByResourceIdAndStatusIn(String resourceId, List<String> statuses);
}

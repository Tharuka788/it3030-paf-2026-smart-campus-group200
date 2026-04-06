package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserEmail(String userEmail);
    List<Booking> findByStatus(String status);
}

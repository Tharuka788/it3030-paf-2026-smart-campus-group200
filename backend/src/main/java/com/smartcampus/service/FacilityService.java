package com.smartcampus.service;

import com.smartcampus.model.Facility;
import com.smartcampus.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public List<Facility> getAllFacilities(String type, Integer minCapacity, String location) {
        List<Facility> facilities = facilityRepository.findAll();
        
        // Simple in-memory filtering for demonstration (usually done via Mongo queries)
        if (type != null && !type.isEmpty()) {
            facilities = facilities.stream()
                .filter(f -> f.getType() != null && f.getType().name().equalsIgnoreCase(type))
                .collect(Collectors.toList());
        }
        
        if (minCapacity != null) {
            facilities = facilities.stream()
                .filter(f -> f.getCapacity() != null && f.getCapacity() >= minCapacity)
                .collect(Collectors.toList());
        }
        
        if (location != null && !location.isEmpty()) {
            facilities = facilities.stream()
                .filter(f -> f.getLocation() != null && f.getLocation().toLowerCase().contains(location.toLowerCase()))
                .collect(Collectors.toList());
        }
        
        return facilities;
    }

    public Facility getFacilityById(String id) {
        return facilityRepository.findById(id).orElseThrow(() -> new RuntimeException("Facility not found with ID: " + id));
    }

    public Facility createFacility(Facility facility) {
        if (facility.getStatus() == null) {
            facility.setStatus(Facility.FacilityStatus.ACTIVE);
        }
        return facilityRepository.save(facility);
    }

    public Facility updateFacility(String id, Facility updatedFacility) {
        Facility existing = getFacilityById(id);
        
        existing.setName(updatedFacility.getName());
        existing.setType(updatedFacility.getType());
        existing.setCapacity(updatedFacility.getCapacity());
        existing.setLocation(updatedFacility.getLocation());
        existing.setStatus(updatedFacility.getStatus());
        existing.setAvailabilityWindows(updatedFacility.getAvailabilityWindows());
        existing.setDescription(updatedFacility.getDescription());
        
        return facilityRepository.save(existing);
    }

    public void deleteFacility(String id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found with ID: " + id);
        }
        facilityRepository.deleteById(id);
    }
}

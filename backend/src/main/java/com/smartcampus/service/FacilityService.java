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

    private void validateFacility(Facility facility) {
        if (facility.getName() == null || facility.getName().trim().isEmpty()) {
            throw new RuntimeException("Facility name is required");
        }
        if (facility.getType() == null) {
            throw new RuntimeException("Facility type is required");
        }
        if (facility.getCapacity() != null && facility.getCapacity() < 0) {
            throw new RuntimeException("Capacity cannot be negative");
        }
    }

    public Facility createFacility(Facility facility) {
        validateFacility(facility);
        if (facility.getStatus() == null) {
            facility.setStatus(Facility.FacilityStatus.ACTIVE);
        }
        return facilityRepository.save(facility);
    }

    public Facility updateFacility(String id, Facility updatedFacility) {
        Facility existing = getFacilityById(id);
        
        if (updatedFacility.getName() != null) existing.setName(updatedFacility.getName());
        if (updatedFacility.getType() != null) existing.setType(updatedFacility.getType());
        if (updatedFacility.getCapacity() != null) existing.setCapacity(updatedFacility.getCapacity());
        if (updatedFacility.getLocation() != null) existing.setLocation(updatedFacility.getLocation());
        if (updatedFacility.getStatus() != null) existing.setStatus(updatedFacility.getStatus());
        if (updatedFacility.getAvailabilityWindows() != null) existing.setAvailabilityWindows(updatedFacility.getAvailabilityWindows());
        if (updatedFacility.getDescription() != null) existing.setDescription(updatedFacility.getDescription());
        
        validateFacility(existing);
        return facilityRepository.save(existing);
    }

    public void deleteFacility(String id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found with ID: " + id);
        }
        facilityRepository.deleteById(id);
    }
}

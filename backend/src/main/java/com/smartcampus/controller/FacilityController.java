package com.smartcampus.controller;

import com.smartcampus.model.Facility;
import com.smartcampus.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows calls from React app during dev
public class FacilityController {

    private final FacilityService facilityService;

    // 1. GET Method
    @GetMapping
    public ResponseEntity<List<Facility>> getAllFacilities(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(facilityService.getAllFacilities(type, minCapacity, location));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facility> getFacilityById(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    // 2. POST Method
    @PostMapping
    public ResponseEntity<Facility> createFacility(@RequestBody Facility facility) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.createFacility(facility));
    }

    // 3. PUT Method
    @PutMapping("/{id}")
    public ResponseEntity<Facility> updateFacility(@PathVariable String id, @RequestBody Facility facility) {
        return ResponseEntity.ok(facilityService.updateFacility(id, facility));
    }

    // 4. DELETE Method
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }
}

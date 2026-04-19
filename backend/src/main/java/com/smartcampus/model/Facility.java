package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "facilities")
public class Facility {

    @Id
    private String id;
    
    private String name;
    
    private FacilityType type;
    
    private Integer capacity;
    
    private String location;
    
    private FacilityStatus status;
    
    private List<AvailabilityWindow> availabilityWindows;

    private String description;
    
    public enum FacilityType {
        ROOM, LECTURE_HALL, LAB, EQUIPMENT, OTHER
    }

    public enum FacilityStatus {
        ACTIVE, OUT_OF_SERVICE, MAINTENANCE
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityWindow {
        private String dayOfWeek;
        private String startTime; // Format: "HH:mm"
        private String endTime; // Format: "HH:mm"
    }
}

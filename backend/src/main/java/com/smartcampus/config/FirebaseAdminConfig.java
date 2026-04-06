package com.smartcampus.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseAdminConfig {

    @Value("${firebase.service-account-key-path:}")
    private String serviceAccountKeyPath;

    @Value("${firebase.project-id:}")
    private String projectId;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }

            FirebaseOptions.Builder builder = FirebaseOptions.builder();

            if (serviceAccountKeyPath != null && !serviceAccountKeyPath.isBlank()) {
                try (FileInputStream serviceAccount = new FileInputStream(serviceAccountKeyPath)) {
                    builder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                }
            } else {
                builder.setCredentials(GoogleCredentials.getApplicationDefault());
            }

            if (projectId != null && !projectId.isBlank()) {
                builder.setProjectId(projectId);
            }

            FirebaseApp.initializeApp(builder.build());
        } catch (IOException e) {
            System.err.println("Failed to initialize Firebase: " + e.getMessage());
            // Continue without Firebase for development
        }
    }
}

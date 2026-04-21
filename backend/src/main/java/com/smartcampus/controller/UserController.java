package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        String email = user.getEmail().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User loginRequest) {
        String email = loginRequest.getEmail().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getPassword() == null) {
            throw new RuntimeException("This account uses Google Login. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    @PostMapping("/sync")
    public User syncUser(@RequestBody User userRequest) {
        String email = userRequest.getEmail().toLowerCase();
        System.out.println("Syncing user: " + email);
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    System.out.println("User exists, updating: " + existingUser.getEmail());
                    existingUser.setFullName(userRequest.getFullName());
                    existingUser.setPictureUrl(userRequest.getPictureUrl());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    System.out.println("New user, creating: " + email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName(userRequest.getFullName());
                    newUser.setPictureUrl(userRequest.getPictureUrl());
                    newUser.setRole("ROLE_USER");
                    return userRepository.save(newUser);
                });
    }

    @GetMapping("/me")
    public User getMe(@RequestParam String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

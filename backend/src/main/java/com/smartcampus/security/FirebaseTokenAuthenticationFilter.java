package com.smartcampus.security;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;

@Component
@RequiredArgsConstructor
public class FirebaseTokenAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        // Skip authentication if Firebase is not initialized
        if (FirebaseApp.getApps().isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String idToken = authorizationHeader.substring(7);

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();

            if (email != null && !email.isBlank()) {
                syncUser(decodedToken, email);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
                authentication.setDetails(decodedToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (FirebaseAuthException ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private void syncUser(FirebaseToken decodedToken, String email) {
        String fullName = (String) decodedToken.getClaims().getOrDefault("name", email);
        String pictureUrl = (String) decodedToken.getClaims().get("picture");

        userRepository.findByEmail(email).ifPresentOrElse(existingUser -> {
            existingUser.setFullName(fullName);
            existingUser.setPictureUrl(pictureUrl);
            if (existingUser.getRoles() == null || existingUser.getRoles().isEmpty()) {
                existingUser.setRoles(new HashSet<>(Collections.singletonList("ROLE_USER")));
            }
            userRepository.save(existingUser);
        }, () -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setPictureUrl(pictureUrl);
            newUser.setRoles(new HashSet<>(Collections.singletonList("ROLE_USER")));
            userRepository.save(newUser);
        });
    }
}

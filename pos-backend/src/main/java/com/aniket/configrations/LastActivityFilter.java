package com.aniket.configrations;

import com.aniket.modal.User;
import com.aniket.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Duration;

@Component
public class LastActivityFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    // Throttle: only persist lastActivity if at least 5 minutes have passed
    private static final Duration THROTTLE_WINDOW = Duration.ofMinutes(5);

    public LastActivityFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getName() != null) {
            String email = auth.getName();
            User user = userRepository.findByEmail(email);
            if (user != null) {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime lastActivity = user.getLastActivity();

                // Only persist if throttle window has elapsed or no previous activity
                if (lastActivity == null || Duration.between(lastActivity, now).compareTo(THROTTLE_WINDOW) >= 0) {
                    user.setLastActivity(now);
                    userRepository.save(user);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
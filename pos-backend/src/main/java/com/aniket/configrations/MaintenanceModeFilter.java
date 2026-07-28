package com.aniket.configrations;

import com.aniket.payload.response.ApiResponse;
import com.aniket.service.SystemSettingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class MaintenanceModeFilter extends OncePerRequestFilter {

    private final SystemSettingService systemSettingService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        // Only check maintenance mode for API routes
        if (path.startsWith("/api/")) {
            boolean isMaintenanceMode = systemSettingService.getBooleanSetting("maintenanceMode", false);

            if (isMaintenanceMode) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                boolean isAdmin = auth != null && auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                // Block non-admins during maintenance mode (allow auth routes to login)
                if (!isAdmin && !path.startsWith("/auth/")) {
                    response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
                    response.setContentType("application/json");
                    
                    ApiResponse<Void> apiResponse = new ApiResponse<>(false, "System is under maintenance. Please try again later.", null);
                    response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

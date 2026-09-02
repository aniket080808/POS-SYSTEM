package com.aniket.configrations;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        String message = accessDeniedException.getMessage();
        if (message == null || message.trim().isEmpty() || message.equalsIgnoreCase("Access is denied")) {
            message = "Access Denied: You do not have permission to access this resource";
        }
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("message", message);
        errorDetails.put("error", "Forbidden");
        errorDetails.put("status", HttpServletResponse.SC_FORBIDDEN);
        errorDetails.put("path", request.getRequestURI());
        errorDetails.put("timestamp", LocalDateTime.now().toString());

        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
}

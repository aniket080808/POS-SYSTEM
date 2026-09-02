package com.aniket.configrations;

import com.aniket.modal.User;
import com.aniket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.Collections;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Better compatibility for frontend
                .withSockJS();
        registry.addEndpoint("/ws/websocket")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null) {
                    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                        String authHeader = accessor.getFirstNativeHeader("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            try {
                                String email = jwtProvider.getEmailFromJwtToken(authHeader);
                                User user = userRepository.findByEmail(email);
                                if (user != null) {
                                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                            user, null, Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
                                    );
                                    accessor.setUser(auth);
                                }
                            } catch (Exception e) {
                                log.error("WebSocket JWT validation failed during CONNECT", e);
                            }
                        }
                    } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                        String destination = accessor.getDestination();
                        if (destination != null && destination.startsWith("/topic/admin-notifications/")) {
                            String targetIdStr = destination.substring("/topic/admin-notifications/".length());
                            Principal principal = accessor.getUser();
                            if (principal instanceof UsernamePasswordAuthenticationToken authToken) {
                                Object principalObj = authToken.getPrincipal();
                                if (principalObj instanceof User authenticatedUser) {
                                    if (!String.valueOf(authenticatedUser.getId()).equals(targetIdStr)) {
                                        log.warn("Unauthorized STOMP subscription attempt! User ID {} attempted to subscribe to {}",
                                                authenticatedUser.getId(), destination);
                                        throw new AccessDeniedException("Unauthorized subscription to topic: " + destination);
                                    }
                                }
                            } else {
                                log.warn("Unauthenticated STOMP subscription attempt to {}", destination);
                                throw new AccessDeniedException("Authentication required to subscribe to: " + destination);
                            }
                        }
                    }
                }
                return message;
            }
        });
    }
}


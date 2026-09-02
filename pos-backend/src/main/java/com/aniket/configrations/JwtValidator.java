package com.aniket.configrations;

import com.aniket.modal.StoreSettings;
import com.aniket.modal.User;
import com.aniket.repository.StoreSettingsRepository;
import com.aniket.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class JwtValidator extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final StoreSettingsRepository storeSettingsRepository;

    public JwtValidator(UserRepository userRepository, StoreSettingsRepository storeSettingsRepository) {
        this.userRepository = userRepository;
        this.storeSettingsRepository = storeSettingsRepository;
    }

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
									FilterChain filterChain) throws ServletException, IOException {
		String jwt = request.getHeader(JwtConstant.JWT_HEADER);
		if (jwt != null && !jwt.trim().isEmpty()) {
			if (jwt.startsWith("Bearer ") || jwt.startsWith("bearer ")) {
				jwt = jwt.substring(7).trim();
			} else {
				jwt = jwt.trim();
			}

			// 1) Parse and validate the JWT token
			Claims claims;
			try{
				SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
				claims = Jwts.parser().verifyWith(key).build()
						.parseSignedClaims(jwt).getPayload();
			}catch (Exception e){
				throw new BadCredentialsException("Invalid token....");
			}

			String email = String.valueOf(claims.get("email"));
			String authorities = String.valueOf(claims.get("authorities"));

			List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
			Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);
			SecurityContextHolder.getContext().setAuthentication(authentication);

			// 2) User status & session validation
			try {
				User user = userRepository.findByEmail(email);
				if (user != null) {
					request.setAttribute("AUTHENTICATED_USER", user);
					// 2a) Immediate rejection for disabled accounts
					if (Boolean.FALSE.equals(user.getEnabled())) {
						SecurityContextHolder.clearContext();
						throw new BadCredentialsException("Account has been disabled");
					}

					// 2b) Immediate rejection for tokens issued before password reset
					if (user.getPasswordChangedAt() != null && claims.getIssuedAt() != null) {
						long iatMillis = claims.getIssuedAt().getTime();
						long pwdChangedMillis = user.getPasswordChangedAt()
								.atZone(java.time.ZoneId.systemDefault())
								.toInstant()
								.toEpochMilli();
						// If token was issued before password changed timestamp (allowing 1s clock skew)
						if (iatMillis + 1000L < pwdChangedMillis) {
							SecurityContextHolder.clearContext();
							throw new BadCredentialsException("Session invalidated due to password change. Please log in again.");
						}
					}

					// 2c) Inactivity expiration check
					if (user.getStore() != null) {
						LocalDateTime lastActivity = user.getLastActivity();
						if (lastActivity != null) {
							Optional<StoreSettings> settingsOpt = storeSettingsRepository.findByStoreId(user.getStore().getId());
							int timeoutMinutes = settingsOpt.map(StoreSettings::getSessionTimeout).orElse(30);
							if (timeoutMinutes < 10) {
								timeoutMinutes = 10; // Enforce minimum to avoid throttle conflicts
							}
							if (Duration.between(lastActivity, LocalDateTime.now()).toMinutes() > timeoutMinutes) {
								SecurityContextHolder.clearContext();
								throw new BadCredentialsException("Session expired due to inactivity");
							}
						}
					}
				}
			} catch (BadCredentialsException bce) {
				throw bce; // re-throw session / auth invalidation
			} catch (Exception e) {
				// Log but don't block the request — fallback check is non-critical
				logger.warn("Error during user validation in JwtValidator, skipping: " + e.getMessage());
			}
		}
		filterChain.doFilter(request, response);
	}

}

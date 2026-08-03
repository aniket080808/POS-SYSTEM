package com.aniket.configrations;

import com.aniket.configrations.CustomAuthenticationEntryPoint;
import com.aniket.configrations.MaintenanceModeFilter;
import com.aniket.configrations.SubscriptionGuardFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;


@Configuration
public class SecurityConfig {
	
	@Autowired
	private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

	@Autowired
	private MaintenanceModeFilter maintenanceModeFilter;

	@Autowired
	private SubscriptionGuardFilter subscriptionGuardFilter;

	@Autowired
	private JwtValidator jwtValidator;

	@Autowired
	private LastActivityFilter lastActivityFilter;
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		
		return http.sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(Authorize -> Authorize
						// Role-specific rules MUST be declared BEFORE the generic /api/** rule,
						// because Spring Security evaluates rules in order and stops at the first match.
						.requestMatchers("/api/super-admin/notifications/**").hasAnyRole("ADMIN", "STORE_ADMIN", "STORE_MANAGER")
						.requestMatchers("/api/super-admin/**").hasRole("ADMIN")
						.requestMatchers("/api/**").authenticated()
						.anyRequest().permitAll())
		.addFilterBefore(jwtValidator, BasicAuthenticationFilter.class)
			.addFilterAfter(lastActivityFilter, JwtValidator.class)
			.addFilterAfter(maintenanceModeFilter, JwtValidator.class)
			.addFilterAfter(subscriptionGuardFilter, MaintenanceModeFilter.class)
			.csrf(AbstractHttpConfigurer::disable)
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.headers(headers -> headers
					.contentTypeOptions(Customizer.withDefaults())
					.frameOptions(frame -> frame.deny())
					.httpStrictTransportSecurity(hsts -> hsts
							.includeSubDomains(true)
							.maxAgeInSeconds(31536000))
					.contentSecurityPolicy(csp -> csp
							.policyDirectives(
								"default-src 'self'; " +
								"script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
								"style-src 'self' 'unsafe-inline'; " +
								"img-src 'self' data: https:; " +
								"font-src 'self' data:; " +
								"connect-src 'self' https:; " +
								"frame-ancestors 'none'"))
			)
			.exceptionHandling(
					exceptionHandler -> exceptionHandler
							.authenticationEntryPoint(customAuthenticationEntryPoint))
			.build();
	}
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	private CorsConfigurationSource corsConfigurationSource() {
		return new CorsConfigurationSource() {
			@Override
			public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
				CorsConfiguration cfg = new CorsConfiguration();
				cfg.setAllowedOrigins(Arrays.asList(
						"http://localhost:3000",
						"http://localhost:5173",
						"https://aniket-pos.vercel.app",
						"https://pos-sytem-bcs6.vercel.app"
				));
				cfg.setAllowedMethods(Collections.singletonList("*"));
				cfg.setAllowCredentials(true);
				cfg.setAllowedHeaders(Collections.singletonList("*"));
				cfg.setExposedHeaders(Arrays.asList("Authorization"));
				cfg.setMaxAge(3600L);
				return cfg;
			}
		};
	}

}

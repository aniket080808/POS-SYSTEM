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

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.util.Arrays;
import java.util.Collections;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {
	
	@Autowired
	private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

	@Autowired
	private CustomAccessDeniedHandler customAccessDeniedHandler;

	@Autowired
	private MaintenanceModeFilter maintenanceModeFilter;

	@Autowired
	private SubscriptionGuardFilter subscriptionGuardFilter;

	@Autowired
	private JwtValidator jwtValidator;

	@Autowired
	private LastActivityFilter lastActivityFilter;
	
	@org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://aniket-pos.vercel.app,https://pos-sytem-bcs6.vercel.app}")
	private String allowedOrigins;
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		
		return http.sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(Authorize -> Authorize
						// Role-specific rules MUST be declared BEFORE the generic /api/** rule,
						// because Spring Security evaluates rules in order and stops at the first match.
						.requestMatchers("/api/super-admin/notifications/**").hasAnyRole("ADMIN", "STORE_ADMIN", "STORE_MANAGER", "BRANCH_ADMIN", "BRANCH_MANAGER", "BRANCH_CASHIER")
						.requestMatchers("/api/super-admin/**").hasRole("ADMIN")
						.requestMatchers("/auth/**").permitAll()
						.requestMatchers("/ws/**").permitAll()
						.requestMatchers("/error").permitAll()
						// Allow unauthenticated visitors to read active subscription plans and submit contact inquiries
						.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/subscription-plans", "/api/subscription-plans/**").permitAll()
						.requestMatchers("/api/public/**").permitAll()
						.requestMatchers("/api/**").authenticated()
						.anyRequest().authenticated())
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
							.authenticationEntryPoint(customAuthenticationEntryPoint)
							.accessDeniedHandler(customAccessDeniedHandler))
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
				java.util.List<String> origins = Arrays.stream(allowedOrigins.split(","))
						.map(String::trim)
						.filter(s -> !s.isEmpty())
						.toList();
				cfg.setAllowedOrigins(origins);
				cfg.setAllowedOriginPatterns(Arrays.asList(
						"http://localhost:*",
						"https://*.vercel.app",
						"https://*.pages.dev",
						"https://*.onrender.com"
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

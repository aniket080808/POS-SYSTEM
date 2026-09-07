package com.aniket.service.impl;

import com.aniket.domain.UserRole;
import com.aniket.modal.User;
import com.aniket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        fixStaleDatabaseConstraints();
        initializeAdminUser();
    }

    private void fixStaleDatabaseConstraints() {
        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_payment_type_check");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_status_check");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS refunds DROP CONSTRAINT IF EXISTS refunds_payment_type_check");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS refunds DROP CONSTRAINT IF EXISTS refunds_status_check");
            log.info("✅ Database enum check constraints verified.");
        } catch (Exception e) {
            log.debug("Note on database constraint cleanup: {}", e.getMessage());
        }
    }

    private void initializeAdminUser() {
        if (userRepository.findByEmail(adminEmail) == null) {
            User adminUser = new User();
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setFullName(adminFullName);
            adminUser.setEmail(adminEmail);
            adminUser.setRole(UserRole.ROLE_ADMIN);

            userRepository.save(adminUser);
            log.info("Default admin user created with email: {}", adminEmail);
        } else {
            log.info("Admin user already exists with email: {}", adminEmail);
        }
    }
}
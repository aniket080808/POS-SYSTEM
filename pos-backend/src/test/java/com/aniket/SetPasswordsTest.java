package com.aniket;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class SetPasswordsTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    @DisplayName("Verify BCrypt Password Encoder generates independent salt and matches plaintext")
    void testBcryptEncoderIndependentSalts() {
        String rawPassword = "SamplePassword123@";
        
        String hash1 = passwordEncoder.encode(rawPassword);
        String hash2 = passwordEncoder.encode(rawPassword);

        // Standard BCrypt must generate different hashes for same input due to random salt
        assertNotEquals(hash1, hash2, "BCrypt should generate unique salts for each hash operation");

        // Both hashes must validate against the original raw password
        assertTrue(passwordEncoder.matches(rawPassword, hash1), "Hash 1 should match raw password");
        assertTrue(passwordEncoder.matches(rawPassword, hash2), "Hash 2 should match raw password");
    }
}


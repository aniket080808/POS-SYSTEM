package com.aniket.repository;

import com.aniket.modal.PasswordResetToken;
import com.aniket.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteAllByExpiryDateBefore(LocalDateTime dateTime);
    void deleteAllByUser(User user);
}

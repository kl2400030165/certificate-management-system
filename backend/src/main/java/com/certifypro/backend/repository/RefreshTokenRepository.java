package com.certifypro.backend.repository;

import com.certifypro.backend.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserId(String userId);

    void deleteByExpiresAtBefore(Instant cutoff);
}


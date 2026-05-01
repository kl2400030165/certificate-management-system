package com.certifypro.backend.repository;

import com.certifypro.backend.model.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, String> {
    List<Certification> findByUserId(String userId);
    List<Certification> findByExpiryDateBefore(LocalDate date);
    List<Certification> findByExpiryDateBetween(LocalDate start, LocalDate end);
    List<Certification> findByExpiryDateBeforeOrExpiryDateBetween(
        LocalDate expiredBefore, LocalDate expiringStart, LocalDate expiringEnd);
    long countByExpiryDateAfter(LocalDate date);
    long countByExpiryDateBefore(LocalDate date);
    long countByExpiryDateBetween(LocalDate start, LocalDate end);
}

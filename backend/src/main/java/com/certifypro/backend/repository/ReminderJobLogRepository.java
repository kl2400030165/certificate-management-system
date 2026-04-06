package com.certifypro.backend.repository;

import com.certifypro.backend.model.ReminderJobLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderJobLogRepository extends JpaRepository<ReminderJobLog, String> {
    List<ReminderJobLog> findTop10ByOrderByCreatedAtDesc();
}

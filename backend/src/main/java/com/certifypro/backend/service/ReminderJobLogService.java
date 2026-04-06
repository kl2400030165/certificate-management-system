package com.certifypro.backend.service;

import com.certifypro.backend.model.ReminderJobLog;
import com.certifypro.backend.repository.ReminderJobLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReminderJobLogService {

    private final ReminderJobLogRepository logRepository;

    public ReminderJobLogService(ReminderJobLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public ReminderJobLog log(String jobType, String status, String message) {
        ReminderJobLog entry = ReminderJobLog.builder()
                .jobType(jobType)
                .status(status)
                .message(message)
                .build();
        return logRepository.save(entry);
    }

    public List<ReminderJobLog> getRecentLogs() {
        return logRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public void clearLogs() {
        logRepository.deleteAll();
    }
}

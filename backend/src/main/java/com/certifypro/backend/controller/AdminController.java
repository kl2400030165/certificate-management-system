package com.certifypro.backend.controller;

import com.certifypro.backend.dto.CertResponse;
import com.certifypro.backend.model.ReminderJobLog;
import com.certifypro.backend.scheduler.ExpirationReminderScheduler;
import com.certifypro.backend.service.AdminService;
import com.certifypro.backend.service.ReminderJobLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ExpirationReminderScheduler reminderScheduler;
    private final ReminderJobLogService reminderJobLogService;

    public AdminController(AdminService adminService,
                           ExpirationReminderScheduler reminderScheduler,
                           ReminderJobLogService reminderJobLogService) {
        this.adminService = adminService;
        this.reminderScheduler = reminderScheduler;
        this.reminderJobLogService = reminderJobLogService;
    }

    @GetMapping("/certs")
    public ResponseEntity<List<CertResponse>> getAllCerts() {
        return ResponseEntity.ok(adminService.getAllCerts());
    }

    @GetMapping("/certs/{id}")
    public ResponseEntity<?> getCertById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(adminService.getCertById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/certs/expiring")
    public ResponseEntity<List<CertResponse>> getExpiringCerts(
            @RequestParam(required = false) String filter) {
        return ResponseEntity.ok(adminService.getExpiringCerts(filter));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @PutMapping("/certs/{id}/renew")
    public ResponseEntity<?> approveRenewal(@PathVariable String id) {
        try {
            CertResponse response = adminService.approveRenewal(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/certs/{id}/notify")
    public ResponseEntity<?> notifyUser(@PathVariable String id) {
        try {
            adminService.notifyUser(id);
            return ResponseEntity.ok(Map.of("message", "Notification sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/reminders/run-daily")
    public ResponseEntity<?> runDailyReminders() {
        try {
            reminderScheduler.sendExpirationReminders();
            ReminderJobLog log = reminderJobLogService.log("DAILY", "SUCCESS", "Daily reminder job executed");
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            ReminderJobLog log = reminderJobLogService.log("DAILY", "FAILED", "Daily reminder job failed");
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Daily reminder job failed",
                    "error", e.getMessage(),
                    "logId", log.getId()
            ));
        }
    }

    @PostMapping("/reminders/run-weekly")
    public ResponseEntity<?> runWeeklyDigest() {
        try {
            reminderScheduler.sendWeeklySummary();
            ReminderJobLog log = reminderJobLogService.log("WEEKLY", "SUCCESS", "Weekly digest job executed");
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            ReminderJobLog log = reminderJobLogService.log("WEEKLY", "FAILED", "Weekly digest job failed");
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Weekly digest job failed",
                    "error", e.getMessage(),
                    "logId", log.getId()
            ));
        }
    }

    @GetMapping("/reminders/logs")
    public ResponseEntity<List<ReminderJobLog>> getReminderLogs() {
        return ResponseEntity.ok(reminderJobLogService.getRecentLogs());
    }

    @DeleteMapping("/reminders/logs")
    public ResponseEntity<?> clearReminderLogs() {
        reminderJobLogService.clearLogs();
        return ResponseEntity.ok(Map.of("message", "Reminder logs cleared"));
    }
}

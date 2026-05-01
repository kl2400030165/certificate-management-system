package com.certifypro.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableCaching
public class CertifyProApplication {
    public static void main(String[] args) {
        SpringApplication.run(CertifyProApplication.class, args);
    }
}

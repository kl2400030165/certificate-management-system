package com.certifypro.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;

import java.lang.reflect.Method;

/**
 * Ensures that exceptions thrown inside @Async methods (e.g. EmailService)
 * are logged with their full stack trace instead of being silently dropped.
 *
 * Without this, a bad Gmail App Password or SMTP timeout will produce NO log
 * output, making email issues invisible in Render logs.
 */
@Configuration
public class AsyncConfig implements AsyncConfigurer {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (Throwable ex, Method method, Object... params) ->
            log.error("❌ @Async method '{}' threw an uncaught exception: {}",
                    method.getName(), ex.getMessage(), ex);
    }
}

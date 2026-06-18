package com.scholarship.scholarshipportal;

import com.scholarship.scholarshipportal.config.LocalInfraBootstrap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Entry Point.
 *
 * @EnableScheduling activates Spring's task scheduling infrastructure,
 * allowing @Scheduled methods in ScheduledTaskService to execute:
 * - Scholarship expiry (daily at midnight)
 * - Application archival (weekly)
 * - Analytics cache refresh (every 5 minutes)
 * - Cache metrics logging (every 10 minutes)
 */
@SpringBootApplication
@EnableScheduling
public class ScholarshipportalApplication {

	public static void main(String[] args) {
		LocalInfraBootstrap.start();
		Runtime.getRuntime().addShutdownHook(new Thread(LocalInfraBootstrap::stop));
		SpringApplication.run(ScholarshipportalApplication.class, args);
	}

}

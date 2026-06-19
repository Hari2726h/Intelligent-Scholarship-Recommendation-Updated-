package com.scholarship.scholarshipportal;

import com.scholarship.scholarshipportal.config.LocalInfraBootstrap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ScholarshipportalApplicationTests {

	@BeforeAll
	static void setUp() {
		LocalInfraBootstrap.start();
	}

	@AfterAll
	static void tearDown() {
		LocalInfraBootstrap.stop();
	}

	@Test
	void contextLoads() {
	}

}

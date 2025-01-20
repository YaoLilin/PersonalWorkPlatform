package com.personalwork;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.personalwork.dao")
public class WorkPlatformServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkPlatformServerApplication.class, args);
	}

}

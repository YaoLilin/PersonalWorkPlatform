package com.personalwork;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.Clock;

@SpringBootApplication
@MapperScan("com.personalwork.dao")
public class WorkPlatformServerApplication {

	/**
	 * 提供应用使用的系统时钟，使依赖当前日期的逻辑可在测试中固定时间。
	 *
	 * @return 系统默认时区的时钟
	 */
	@Bean
	public Clock clock() {
		return Clock.systemDefaultZone();
	}

	public static void main(String[] args) {
		SpringApplication.run(WorkPlatformServerApplication.class, args);
	}

}

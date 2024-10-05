package com.personalwork.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * @author yaolilin
 * @desc todo
 * @date 2024/10/5
 **/
@Component
@PropertySource("classpath:/config/secret.yml")
@Data
public class SecretProperties {
    @Value("${jwt-secret}")
    private String jwtSecret;
}

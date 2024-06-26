package com.personalwork.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * @author 姚礼林
 * @desc 允许前端跨域请求
 * @date 2024/3/13
 */
@Configuration
public class GatewayCorsConfiguration {
    @Bean
    public CorsFilter corsFilter(){
        // 初始化cors配置对象
        CorsConfiguration configuration = new CorsConfiguration();
        // 允许使用cookie，但是使用cookie是addAllowedOrigin必须是具体的地址，不能是*
        configuration.setAllowCredentials(true);
//        configuration.addAllowedOrigin("*");
        configuration.addAllowedOrigin("http://localhost:3000");
        //允许的请求方式,get,put,post,delete
        configuration.addAllowedMethod("*");
        //允许的头信息
        configuration.addAllowedHeader("*");

        //初始化cors的源对象配置
        UrlBasedCorsConfigurationSource corsConfigurationSource = new UrlBasedCorsConfigurationSource();
        corsConfigurationSource.registerCorsConfiguration("/**",configuration);

        //3.返回新的CorsFilter.
        return new CorsFilter(corsConfigurationSource);
    }
}

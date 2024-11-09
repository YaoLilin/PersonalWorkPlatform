package com.personalwork.security.config;

import com.personalwork.anotations.NoAuthRequired;
import com.personalwork.security.CustomAuthenticationEntryPoint;
import com.personalwork.security.JwtAuthenticationTokenFilter;
import com.personalwork.security.Md5PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.condition.PathPatternsRequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author yaolilin
 * @desc SpringSecurity配置类
 * @date 2024/8/17
 **/
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig  {
    private final JwtAuthenticationTokenFilter jwtFilter;
    private final ApplicationContext applicationContext;

    /**
     * 密码明文加密方式配置
     *
     * @return 密码加密方式
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Md5PasswordEncoder();
    }

    @Bean
    public CustomAuthenticationEntryPoint customAuthenticationEntryPoint() {
        return new CustomAuthenticationEntryPoint();
    }

    /**
     * 获取AuthenticationManager（认证管理器），登录时认证使用
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        RequestMappingHandlerMapping requestMappingHandlerMapping =
                (RequestMappingHandlerMapping) applicationContext.getBean("requestMappingHandlerMapping");
        Map<RequestMappingInfo, HandlerMethod> handlerMethodMap = requestMappingHandlerMapping.getHandlerMethods();
        List<String> unAuthRequireUrls = getUnAuthRequireUrls(handlerMethodMap);
        return http
                // 基于 token，不需要 csrf
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorizeHttpRequests ->
                        authorizeHttpRequests
                                // 指定某些接口不需要通过验证即可访问。登录接口肯定是不需要认证的
                                .requestMatchers(unAuthRequireUrls.toArray(new String[0])).permitAll()
                                // 静态资源，可匿名访问
                                .requestMatchers(HttpMethod.GET, "/", "/*.html", "/*/*.html",
                                        "/*/*.css", "/*/*.js", "/profile/**").permitAll()
                                .requestMatchers("/swagger-ui.html", "/swagger-resources/**",
                                        "/webjars/**", "/*/api-docs", "/druid/**", "/doc.html").permitAll()
                                .anyRequest().authenticated()
                )
                // 基于 token，不需要 session
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e ->
                    // 自定义未认证处理
                    e.authenticationEntryPoint(customAuthenticationEntryPoint())
                    // 自定义未授权处理
                    .accessDeniedHandler(customAuthenticationEntryPoint())
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    private List<String> getUnAuthRequireUrls( Map<RequestMappingInfo, HandlerMethod> handlerMethodMap) {
        // 通过判断 controller 方法有没有添加 @NoAuthRequired 注解，获取不需要进行认证的url
        List<String> urls = new ArrayList<>();
        // handlerMethodMap 包含所有 controller 方法信息
        for (Map.Entry<RequestMappingInfo, HandlerMethod> infoEntry : handlerMethodMap.entrySet()) {
            HandlerMethod handlerMethod = infoEntry.getValue();
            if (handlerMethod.getMethodAnnotation(NoAuthRequired.class) != null) {
                // 获取请求路径
                PathPatternsRequestCondition patternsCondition = infoEntry.getKey().getPathPatternsCondition();
                if (patternsCondition != null) {
                    urls.addAll(patternsCondition.getPatternValues());
                }
            }
        }
        return urls;
    }
}

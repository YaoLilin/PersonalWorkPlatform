package com.personalwork.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

/**
 * @author yaolilin
 * @desc 处理认证失败和授权失败
 * @date 2024/8/18
 **/

public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint, AccessDeniedHandler {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        // 未认证的情况
        response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        // 未授权的情况
        response.sendError(HttpStatus.FORBIDDEN.value(), "Forbidden");
    }
}

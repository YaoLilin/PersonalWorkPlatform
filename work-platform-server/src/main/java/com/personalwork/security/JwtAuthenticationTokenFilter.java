package com.personalwork.security;

import com.personalwork.constants.RedisKeyNames;
import com.personalwork.security.bean.UserDetail;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * @author yaolilin
 * @desc 认证过滤器，使用JWT进行认证校验
 * @date 2024/8/18
 **/
@Component
@RequiredArgsConstructor
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {
    private final UserDetailsService userDetailsService;
    private final JwtTokenManager jwtTokenManager;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        //获取token
        String token = request.getHeader("token");
        if (!StringUtils.hasText(token)) {
            //放行
            filterChain.doFilter(request, response);
            return;
        }
        // 解析token
        if (!jwtTokenManager.verify(token)) {
            unauthorizedError(response);
            return;
        }
        if (!existUserInRedis(token)) {
            unauthorizedError(response);
            return;
        }
        String username = jwtTokenManager.getUserName(token);
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            setUserContext(request, username);
        }
        //放行
        filterChain.doFilter(request, response);
    }

    private void unauthorizedError(HttpServletResponse response) throws IOException {
        response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized");
    }

    private boolean existUserInRedis(String token) {
        String userId = jwtTokenManager.getUserId(token);
        Map<Object, Object> userCache = stringRedisTemplate.opsForHash()
                .entries(RedisKeyNames.PREFIX_LOGIN_USER + userId);
        return !userCache.isEmpty();
    }

    private void setUserContext(HttpServletRequest request, String username) {
        Object loginUser = request.getSession().getAttribute("loginUser");
        if (loginUser == null) {
            loginUser = userDetailsService.loadUserByUsername(username);
        }
        UserDetail userDetails = (UserDetail) loginUser;
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}



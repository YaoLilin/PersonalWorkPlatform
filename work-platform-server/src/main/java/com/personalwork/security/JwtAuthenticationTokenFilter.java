package com.personalwork.security;

import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * @author yaolilin
 * @desc todo
 * @date 2024/8/18
 **/
@Component
@RequiredArgsConstructor
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException{
        //获取token
        String token = request.getHeader("token");
        if (!StringUtils.hasText(token)) {
            //放行
            filterChain.doFilter(request, response);
            return;
        }
        //解析token
        if (!JwtUtil.verify(token)) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized");
            return;
        }
        String username = JwtUtil.getUserName(token);
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            setUserContext(request, username);
        }
        //放行
        filterChain.doFilter(request, response);
    }

    private void setUserContext(HttpServletRequest request, String username) {
        Object loginUser = request.getSession().getAttribute("loginUser");
        if (loginUser == null) {
            loginUser = userDetailsService.loadUserByUsername(username);
            request.getSession().setAttribute("loginUser", loginUser);
        }
        UserDetail userDetails = (UserDetail) loginUser;
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}



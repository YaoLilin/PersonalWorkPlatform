package com.personalwork.security.service;

import com.personalwork.enu.LoginResultType;
import com.personalwork.modal.entity.UserDo;
import com.personalwork.modal.query.UserParam;
import com.personalwork.modal.vo.LoginResult;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.JwtUtil;
import com.personalwork.util.RSAUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * @author yaolilin
 * @desc 认证业务处理
 * @date 2024/8/17
 **/
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;

    public LoginResult login(UserParam param, HttpServletRequest request) {
        Authentication authentication = authenticate(param);
        if (authentication == null) {
            return new LoginResult(LoginResultType.USER_OR_PASSWORD_ERROR, null);
        }
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetail userDetail = (UserDetail) authentication.getPrincipal();
        request.getSession().setAttribute("loginUser", userDetail);
        UserDo user = userDetail.getUser();
        String token = JwtUtil.sign(user.getName(), String.valueOf(user.getId()));
        return new LoginResult(LoginResultType.SUCCESS,token);
    }

    private Authentication authenticate(UserParam param) {
        String decryptedPassword = RSAUtils.decryptBase64(param.getPassword());
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(param.getName(),decryptedPassword);
        return authenticationManager.authenticate(authenticationToken);
    }
}

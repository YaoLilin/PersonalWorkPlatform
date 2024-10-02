package com.personalwork.security.service;

import com.personalwork.constants.SessionAttrNames;
import com.personalwork.dao.UserMapper;
import com.personalwork.constants.LoginResultType;
import com.personalwork.exception.UserRegisterException;
import com.personalwork.modal.dto.LoginResultDto;
import com.personalwork.modal.entity.UserDo;
import com.personalwork.modal.query.RegisterParam;
import com.personalwork.modal.query.UserParam;
import com.personalwork.security.JwtTokenManager;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.MD5Generator;
import com.personalwork.util.RSAUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
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
    private final UserMapper userMapper;
    private final JwtTokenManager jwtTokenManager;

    public LoginResultDto login(UserParam param, HttpServletRequest request) {
        // 进行认证
        Authentication authentication = authenticate(param);
        if (authentication == null) {
            return new LoginResultDto(LoginResultType.USER_OR_PASSWORD_ERROR, null,null);
        }
        // 生成jwt
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetail userDetail = (UserDetail) authentication.getPrincipal();
        request.getSession().setAttribute(SessionAttrNames.LOGIN_USER, userDetail);
        UserDo user = userDetail.getUser();
        String token = jwtTokenManager.createToken(user.getLoginName(), String.valueOf(user.getId()));
        return new LoginResultDto(LoginResultType.SUCCESS,token,user);
    }

    public LoginResultDto register(RegisterParam param, HttpServletRequest request) {
        String decryptedPassword = RSAUtils.decryptBase64(param.getPassword());
        String encryptPassword = MD5Generator.generateMD5(decryptedPassword);
        UserDo userDo = new UserDo();
        BeanUtils.copyProperties(param, userDo);
        userDo.setPassword(encryptPassword);
        if (!userMapper.insert(userDo)) {
            throw new UserRegisterException("注册失败，插入到数据库失败");
        }
        UserParam loginParam = new UserParam();
        BeanUtils.copyProperties(param, loginParam);
        return login(loginParam, request);
    }

    private Authentication authenticate(UserParam param) {
        String decryptedPassword = RSAUtils.decryptBase64(param.getPassword());
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(param.getLoginName(),decryptedPassword);
        try {
            return authenticationManager.authenticate(authenticationToken);
        } catch (AuthenticationException e) {
            return null;
        }
    }

    public void logout(HttpServletRequest request) {
        request.getSession().removeAttribute(SessionAttrNames.LOGIN_USER);
    }
}

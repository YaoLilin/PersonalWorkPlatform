package com.personalwork.security.service;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import com.personalwork.constants.LoginResultType;
import com.personalwork.constants.RedisKeyNames;
import com.personalwork.dao.UserMapper;
import com.personalwork.exception.UserRegisterException;
import com.personalwork.modal.dto.LoginResultDto;
import com.personalwork.modal.entity.UserDo;
import com.personalwork.modal.query.RegisterParam;
import com.personalwork.modal.query.UserParam;
import com.personalwork.security.JwtTokenManager;
import com.personalwork.security.bean.AuthUser;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.MD5Generator;
import com.personalwork.util.RSAUtils;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.concurrent.TimeUnit;

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
    private final StringRedisTemplate redisTemplate;

    public LoginResultDto login(UserParam param) {
        // 进行认证
        Authentication authentication = authenticate(param);
        if (authentication == null) {
            return new LoginResultDto(LoginResultType.USER_OR_PASSWORD_ERROR, null,null);
        }
        // 生成jwt
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetail userDetail = (UserDetail) authentication.getPrincipal();
        String token = jwtTokenManager.createToken(userDetail.getLoginName(), String.valueOf(userDetail.getId()));
        putToRedis(userDetail);
        return new LoginResultDto(LoginResultType.SUCCESS,token,userDetail);
    }

    public LoginResultDto register(RegisterParam param) {
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
        return login(loginParam);
    }

    public void logout() {
        Integer loginUserId = UserUtil.getLoginUserId();
        redisTemplate.delete(RedisKeyNames.PREFIX_LOGIN_USER + loginUserId);
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

    private void putToRedis(UserDetail userDetail) {
        AuthUser authUser = new AuthUser();
        BeanUtils.copyProperties(userDetail, authUser);
        redisTemplate.opsForHash().putAll(RedisKeyNames.PREFIX_LOGIN_USER +authUser.getId(),
                BeanUtil.beanToMap(authUser,new HashMap<>(5),
                        new CopyOptions().setFieldValueEditor((s, o) -> o.toString())));
        redisTemplate.expire(RedisKeyNames.PREFIX_LOGIN_USER + authUser.getId(), 3, TimeUnit.DAYS);
    }
}

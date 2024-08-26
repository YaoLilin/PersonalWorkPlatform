package com.personalwork.security;

import com.personalwork.util.MD5Generator;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * @author yaolilin
 * @desc 认证时对用户输入的原始密码进行加密，以及进行密码比较
 * @date 2024/8/17
 **/
public class Md5PasswordEncoder implements PasswordEncoder {

    @Override
    public String encode(CharSequence rawPassword) {
        return MD5Generator.generateMD5(rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        // 对原始密码进行加密，对比数据库中的md5密码
        String encryptedRawPassword = MD5Generator.generateMD5(rawPassword.toString());
        return encryptedRawPassword.equals(encodedPassword);
    }
}

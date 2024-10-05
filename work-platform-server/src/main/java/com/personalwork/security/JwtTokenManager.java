package com.personalwork.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.personalwork.config.SecretProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * @author yaolilin
 * @desc 生成jwt
 * @date 2024/10/1
 **/
@Component
@Slf4j
public class JwtTokenManager {
    private static final long THREE_DAY_EXPIRE_TIME = 1000L * 24 * 60 * 60 * 3;
    @Autowired
    private SecretProperties secretProperties;

    /**
     * 签名生成
     *
     * @return token
     */
    public String createToken(String name, String userId) {
        Date expiresAt = new Date(System.currentTimeMillis() + THREE_DAY_EXPIRE_TIME);
        return JWT.create()
                .withIssuer("auth0").withClaim("id", "id")
                .withClaim("loginName", name)
                .withClaim("userId", userId)
                .withExpiresAt(expiresAt)
                // 使用了HMAC256加密算法。
                .sign(Algorithm.HMAC256(secretProperties.getJwtSecret()));
    }

    /**
     * 签名验证
     *
     * @param token token
     * @return 是否校验成功
     */
    public boolean verify(String token) {
        try {
            JWTVerifier verifier = getJwtVerifier();
            verifier.verify(token);
            return true;
        } catch (Exception e) {
            log.error("jwt 验证失败", e);
            return false;
        }
    }

    public String getUserId(String token) {
        JWTVerifier verifier = getJwtVerifier();
        DecodedJWT jwt = verifier.verify(token);
        return jwt.getClaim("userId").asString();
    }

    public String getUserName(String token) {
        JWTVerifier verifier = getJwtVerifier();
        DecodedJWT jwt = verifier.verify(token);
        return jwt.getClaim("username").asString();
    }

    private JWTVerifier getJwtVerifier() {
        return JWT.require(Algorithm.HMAC256(secretProperties.getJwtSecret()))
                .withIssuer("auth0").build();
    }
}

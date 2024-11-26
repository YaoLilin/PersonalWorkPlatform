package com.personalwork.system.cache;

import cn.hutool.core.text.CharSequenceUtil;
import cn.hutool.json.JSONUtil;
import com.personalwork.util.RedisUtil;
import com.personalwork.util.UserUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * @author yaolilin
 * @desc 缓存切面，实现业务数据缓存
 * @date 2024/11/25
 **/
@Aspect
@Component
@Slf4j
public class CacheAspect {
    private final RedisUtil redisUtil;

    @Autowired
    public CacheAspect(RedisUtil redisUtil) {
        this.redisUtil = redisUtil;
    }

    @Pointcut("@annotation(com.personalwork.system.cache.Cache)")
    public void cache() {
    }

    @Around("cache()")
    public Object toCache(ProceedingJoinPoint point) throws Throwable {
        String redisKey = getRedisKey(point);
        Signature signature = point.getSignature();
        // 访问redis（先尝试获取，没有则访问数据库）
        Object cacheValue = redisUtil.get(redisKey, signature.getDeclaringType());
        if (cacheValue != null) {
            return cacheValue;
        }
        Object proceed = point.proceed();
        // 存入redis
        log.info("数据存入redis缓存,key: {}", redisKey);
        MethodSignature methodSignature = (MethodSignature) signature;
        Cache annotation = methodSignature.getMethod().getAnnotation(Cache.class);
        redisUtil.set(redisKey, proceed, annotation.expire(), TimeUnit.MINUTES);
        return proceed;

    }

    private String getRedisKey(ProceedingJoinPoint point) throws NoSuchMethodException {
        Signature signature = point.getSignature();
        String className = point.getTarget().getClass().getSimpleName();
        String methodName = signature.getName();
        Object[] args = point.getArgs();
        Class[] parameterTypes = Arrays.stream(args).filter(Objects::nonNull)
                .map(Object::getClass).toArray(Class[]::new);
        String params = getParamsStr(args);
        Method method = signature.getDeclaringType().getMethod(methodName, parameterTypes);
        Cache annotation = method.getAnnotation(Cache.class);
        String redisKey;
        if (CharSequenceUtil.isNotBlank(annotation.key())) {
            redisKey = annotation.key();
        } else {
            redisKey = className + ":" + methodName + ":" + params;
        }
        if (annotation.isUserData()) {
            redisKey += ":user:" + UserUtil.getLoginUserId();
        }
        return redisKey;
    }

    private String getParamsStr(Object[] args) {
        String params = Arrays.stream(args).filter(Objects::nonNull)
                .map(JSONUtil::toJsonStr).collect(Collectors.joining());
        if (CharSequenceUtil.isNotEmpty(params)) {
            //加密 以防出现key过长以及字符转义获取不到的情况
            params = DigestUtils.md5Hex(params);
        }
        return params;
    }

}

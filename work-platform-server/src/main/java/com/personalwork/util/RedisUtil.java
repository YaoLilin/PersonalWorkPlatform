package com.personalwork.util;

import cn.hutool.core.text.CharSequenceUtil;
import cn.hutool.json.JSONUtil;
import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * @author yaolilin
 * @desc redis工具类
 * @date 2024/11/24
 **/
@Component
public class RedisUtil {
    private final StringRedisTemplate redisTemplate;

    @Autowired
    public RedisUtil(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void set(String key, Object value, long time, TimeUnit timeUnit) {
        redisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(value), time, timeUnit);
    }

    @Nullable
    public <R> R get(String key, Class<R> type) {
        String value = redisTemplate.opsForValue().get(key);
        if (CharSequenceUtil.isBlank(value)) {
            return null;
        }
        return JSONUtil.toBean(value, type);
    }

    @Nullable
    public <R> List<R> getList(String key, Class<R> type) {
        String value = redisTemplate.opsForValue().get(key);
        if (CharSequenceUtil.isBlank(value)) {
            return null;
        }
        return JSONUtil.toList(JSONUtil.parseArray(value), type);
    }

    public void delete(String key) {
        redisTemplate.delete(key);
    }

    /**
     * 根据匹配的key删除缓存
     * @param pattern 匹配模式，如 user:*
     */
    public void deleteByPattern(String pattern) {
        try (Cursor<String> cursor = redisTemplate.scan(ScanOptions.scanOptions().match(pattern).count(100).build())) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                redisTemplate.delete(key);
            }
        }
    }
}

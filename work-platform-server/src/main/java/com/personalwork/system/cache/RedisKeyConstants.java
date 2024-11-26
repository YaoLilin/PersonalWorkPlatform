package com.personalwork.system.cache;

/**
 * @author yaolilin
 * @desc Redis 键名称
 * @date 2024/11/5
 **/
public class RedisKeyConstants {
    private RedisKeyConstants() {

    }
    public static final String PREFIX_LOGIN_USER_KEY = "login:user:";
    public static final String WEEK_LIST_KEY = "week:list:user:";
    public static final long WEEK_LIST_TTL = 60 * 60 * 4L;
    public static final String MONTH_LIST_KEY = "month:list:user:";
    public static final long MONTH_LIST_TTL = 60 * 60 * 4L;

}

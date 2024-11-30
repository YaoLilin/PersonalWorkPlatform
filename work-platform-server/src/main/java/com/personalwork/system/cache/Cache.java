package com.personalwork.system.cache;

import java.lang.annotation.*;

/**
 * @author yaolilin
 * @desc 缓存注解，标识此注解的方法表示启用缓存
 * @date 2024/11/25
 **/
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Cache {
    /**
     * 过期时间，单位秒，默认60秒
     */
    long expire() default RedisKeyConstants.DEFAULT_TTL;
    String key();
    /**
     * 是否用户数据，如果为用户数据则redis key后面会加上用户id
     */
    boolean isUserData() default false;

    /**
     * 如果缓存的数据为List集合，则必需要指定集合元素的类型，否则无法取出缓存
     */
    Class<?> listElementType() default Object.class;
}

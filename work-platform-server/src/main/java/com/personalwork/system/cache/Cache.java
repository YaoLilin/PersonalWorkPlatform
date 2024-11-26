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
    int expire() default 60;
    String key() default "";
    boolean isUserData() default false;
}

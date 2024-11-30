package com.personalwork.system.cache;

import java.lang.annotation.*;

/**
 * @author yaolilin
 * @desc {@link DeleteCache} 注解容器，允许在使用多个 {@link DeleteCache} 注解
 * @date 2024/11/30
 **/
@Documented
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DeleteCaches {
    DeleteCache[] value();
}

package com.personalwork.system.cache;

import java.lang.annotation.*;

/**
 * @author yaolilin
 * @desc 将该注解添加到方法上，该方法执行后，会删除缓存,比如需要清除缓存的新增、更新数据操作
 * @date 2024/11/27
 **/
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Repeatable(DeleteCaches.class)
public @interface DeleteCache {
    /**
     * 需要删除缓存的key
     */
    String[] value();
    /**
     * 是否用户数据，如果为用户数据则redis key后面会加上用户id
     */
    boolean isUserData() default false;
}

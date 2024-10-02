package com.personalwork.anotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author yaolilin
 * @desc 添加到controller方法上表示不需要进行认证就能访问
 * @date 2024/10/2
 **/
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface NoAuthRequired {
}

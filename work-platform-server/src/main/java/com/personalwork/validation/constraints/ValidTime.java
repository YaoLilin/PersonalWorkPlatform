package com.personalwork.validation.constraints;

import com.personalwork.validation.DateValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/6/20
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DateValidator.class) // 指定校验器类
@Documented
public @interface ValidTime {
    String message() default "时间不能为空且格式应为mm:ss";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

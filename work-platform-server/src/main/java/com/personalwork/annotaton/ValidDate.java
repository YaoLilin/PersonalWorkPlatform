package com.personalwork.annotaton;

import com.personalwork.constants.RegularConstant;
import com.personalwork.verify.ValidDateValidator;
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
@Constraint(validatedBy = ValidDateValidator.class) // 指定校验器类
@Documented
public @interface ValidDate {
    String message() default "日期不能为空且格式应为yyyy-MM-dd";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
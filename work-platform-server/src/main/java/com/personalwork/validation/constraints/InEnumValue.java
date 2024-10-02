package com.personalwork.validation.constraints;

import com.personalwork.constants.EnumValue;
import com.personalwork.validation.IncludesEnumValueValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * @author 姚礼林
 * @desc 校验是否属于指定枚举中的值
 * @date 2024/7/11
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IncludesEnumValueValidator.class) // 指定校验器类
@Documented
public @interface InEnumValue {
    String message() default "";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    Class<? extends EnumValue> value();
}

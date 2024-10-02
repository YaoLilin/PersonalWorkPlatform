package com.personalwork.validation;

import com.personalwork.constants.EnumValue;
import com.personalwork.validation.constraints.InEnumValue;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * @author 姚礼林
 * @desc 校验是否属于指定枚举中的值
 * @date 2024/7/11
 */
public class IncludesEnumValueValidator implements ConstraintValidator<InEnumValue, EnumValue > {
    private Class<? extends EnumValue> requiredValue;
    @Override
    public void initialize(InEnumValue constraintAnnotation) {
        this.requiredValue = constraintAnnotation.value();
    }

    @Override
    public boolean isValid(EnumValue value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        EnumValue[] enumConstants = requiredValue.getEnumConstants();
        if (enumConstants == null) {
            return false;
        }
        for (EnumValue enumC : enumConstants) {
            if (enumC.getValue().equals(value.getValue())) {
                return true;
            }
        }
        return false;
    }

}

package com.personalwork.validation;

import com.personalwork.validation.constraints.ValidTime;
import com.personalwork.constants.RegularConstant;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/6/20
 */
public class ValidTimeValidator implements ConstraintValidator<ValidTime, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value.isEmpty()) {
            return false;
        }
        return value.matches(RegularConstant.TIME);
    }
}

package com.personalwork.verify;

import com.personalwork.annotaton.ValidDate;
import com.personalwork.constants.RegularConstant;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;


/**
 * @author 姚礼林
 */
public class ValidDateValidator implements ConstraintValidator<ValidDate, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value.isEmpty()) {
            return false;
        }
        return value.matches(RegularConstant.DATE);
    }

}

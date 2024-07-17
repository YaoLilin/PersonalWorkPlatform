package com.personalwork.validation;

import com.personalwork.validation.constraints.ValidDate;
import com.personalwork.constants.RegularConstant;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;


/**
 * @author 姚礼林
 */
public class DateValidator implements ConstraintValidator<ValidDate, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        if (value.isEmpty()) {
            return false;
        }
        return value.matches(RegularConstant.DATE);
    }

}

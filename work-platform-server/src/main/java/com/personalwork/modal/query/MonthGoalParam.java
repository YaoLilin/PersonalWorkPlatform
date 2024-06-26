package com.personalwork.modal.query;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/5
 */
@Data
public class MonthGoalParam extends GoalParam{
    @NotNull
    @DecimalMin(value= "1",message = "月份不能小于1")
    @DecimalMax(value= "12",message = "月份不能大于12")
    private Integer month;
}

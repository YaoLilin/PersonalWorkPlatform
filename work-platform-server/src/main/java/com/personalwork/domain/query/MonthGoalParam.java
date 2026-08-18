package com.personalwork.domain.query;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author 姚礼林
 * @desc 月度目标参数
 * @date 2024/5/5
 */
@EqualsAndHashCode(callSuper = false)
@Data
public class MonthGoalParam extends GoalParam{
    @NotNull
    @DecimalMin(value= "1",message = "月份不能小于1")
    @DecimalMax(value= "12",message = "月份不能大于12")
    private Integer month;
    @NotNull(message = "年份不能为空")
    private Integer year;
}

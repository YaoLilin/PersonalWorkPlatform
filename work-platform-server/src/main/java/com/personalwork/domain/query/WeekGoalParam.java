package com.personalwork.domain.query;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author 姚礼林
 * @desc 周目标查询参数
 * @date 2024/5/4
 */
@EqualsAndHashCode(callSuper = false)
@Data
public class WeekGoalParam extends GoalParam{
    @NotNull(message = "周日期不能为空")
    private String  weekDate;
}

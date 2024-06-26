package com.personalwork.modal.query;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/4
 */
@Data
public class WeekGoalParam extends GoalParam{
    @NotNull(message = "周数不能为空")
    private Integer weekNumber;
}

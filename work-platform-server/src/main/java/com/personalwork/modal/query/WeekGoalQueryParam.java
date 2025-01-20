package com.personalwork.modal.query;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc 周记录查询参数
 * @date 2024/5/4
 */
@Data
public class WeekGoalQueryParam{
    private Integer userId;
    private String weekDate;
}

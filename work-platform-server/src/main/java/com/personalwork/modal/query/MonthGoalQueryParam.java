package com.personalwork.modal.query;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc “月记录”查询参数
 * @date 2024/5/5
 */
@Data
public class MonthGoalQueryParam{
    private Integer year;
    private Integer month;
    private Integer userId;
}

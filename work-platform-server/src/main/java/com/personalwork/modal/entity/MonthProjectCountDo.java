package com.personalwork.modal.entity;

import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc 项目的月时间统计
 * @date 2024/3/22
 */
@Data
@ToString
public class MonthProjectCountDo {
    private Integer id;
    private Integer projectId;
    private Integer minute;
    private Integer monthId;
}

package com.personalwork.domain.entity;

import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc 周的项目时间，用于统计每周的各项目总计时间
 * @date 2023/8/27
 */
@Data
@ToString
public class WeekProjectTimeCountDo {
    private Integer id;
    private Integer weekId;
    private Integer project;
    private Integer minutes;
}

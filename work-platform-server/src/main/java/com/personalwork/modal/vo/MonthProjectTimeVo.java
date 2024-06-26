package com.personalwork.modal.vo;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc 月份记录中项目的工作时间统计，例如8月 xx 项目占用 xx 分钟，xx 小时
 * @date 2024/1/23
 */
@Data
public class MonthProjectTimeVo {
    private String projectName;
    private Integer minutes;
    private Double hours;
    private Double percent;
}

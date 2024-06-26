package com.personalwork.modal.vo;

import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 月记录，用于记录每个月的情况，如项目占用时间，工作总结
 * @date 2024/1/22
 */

@Data
public class MonthVo {
    private Integer id;
    private Integer month;
    private Integer year;
    private Integer mark;
    /**
     * 工作总结
     */
    private String summary;
    /**
     * 总工作时间
     */
    private Integer minutes;
    private Double hours;
    private Boolean isSummarize;
    /**
     * 各项目的工作时间
     */
    private List<MonthProjectTimeVo> projectTime;

}

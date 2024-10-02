package com.personalwork.modal.entity;

import com.personalwork.constants.Mark;
import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc 月记录，用于记录每个月的情况，如项目占用时间，工作总结
 * @date 2024/1/22
 */

@Data
@ToString
public class RecordMonthDo {
    private Integer id;
    private Integer month;
    private Integer year;
    private Mark mark;
    /**
     * 工作总结
     */
    private String summary;
    /**
     * 总工作时间
     */
    private Integer workTime;
    private Integer isSummarize;
    private Integer userId;

}

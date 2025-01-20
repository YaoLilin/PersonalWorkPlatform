package com.personalwork.modal.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc 月目标实体类
 * @date 2024/5/4
 */
@TableName("month_goal")
@Data
public class MonthGoalDo{
    private Integer id;
    private Integer projectId;
    private String content;
    private Integer year;
    private Integer isDone;
    private Integer userId;
    private Integer month;
}

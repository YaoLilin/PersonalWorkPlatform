package com.personalwork.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc 周目标实体类
 * @date 2024/5/3
 */
@TableName("week_goal")
@Data
public class WeekGoalDo{
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer projectId;
    private String content;
    private Integer isDone;
    private Integer userId;
    private String  weekDate;
}

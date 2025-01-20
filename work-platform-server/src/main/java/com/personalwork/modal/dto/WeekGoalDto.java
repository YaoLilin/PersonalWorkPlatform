package com.personalwork.modal.dto;

import com.personalwork.modal.entity.ProjectDo;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc “周目标”DTO对象
 * @date 2024/5/3
 */
@Data
public class WeekGoalDto{
    private Integer id;
    private ProjectDo project;
    private String content;
    private Integer year;
    private Integer isDone;
    private String weekDate;
}

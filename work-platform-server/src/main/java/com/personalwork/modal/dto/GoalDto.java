package com.personalwork.modal.dto;

import com.personalwork.modal.entity.ProjectDo;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/4
 */
@Data
public class GoalDto {
    private Integer id;
    private ProjectDo project;
    private String content;
    private Integer year;
    private Integer isDone;
}

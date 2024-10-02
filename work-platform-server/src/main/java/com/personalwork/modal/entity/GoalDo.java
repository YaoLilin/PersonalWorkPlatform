package com.personalwork.modal.entity;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/4
 */
@Data
public class GoalDo {
    private Integer id;
    private Integer projectId;
    private String content;
    private Integer year;
    private Integer isDone;
    private Integer userId;
}

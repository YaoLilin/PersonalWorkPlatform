package com.personalwork.modal.entity;

import com.personalwork.constants.ProblemLevel;
import com.personalwork.constants.ProblemState;
import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/11
 */

@Data
@ToString
public class ProblemDo {
    private Integer id;
    private String title;
    private String resolve;
    private ProblemState state;
    private ProblemLevel level;
    private String weekDate;
    private Integer userId;
}

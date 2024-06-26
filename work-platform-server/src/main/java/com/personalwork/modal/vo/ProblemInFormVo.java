package com.personalwork.modal.vo;

import com.personalwork.enu.ProblemLevel;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/8
 */
@Data
public class ProblemInFormVo {
    private Integer id;
    private String title;
    private String resolve;
    private String weekDate;
    private Integer state;
    private ProblemLevel level;
}

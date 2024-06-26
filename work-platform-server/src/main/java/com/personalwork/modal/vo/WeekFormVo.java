package com.personalwork.modal.vo;

import com.personalwork.enu.Mark;
import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/7
 */
@Data
public class WeekFormVo {
    private String  date;
    private Mark mark;
    private String summary;
    private List<ProjectTimeVo> projectTime;
    private List<ProblemInFormVo> theWeekProblems;
    private List<ProblemInFormVo> nowProblems;
}

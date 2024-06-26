package com.personalwork.modal.dto;

import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.entity.ProjectTimeDo;
import com.personalwork.modal.entity.RecordWeekDo;
import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/15
 */
@Data
public class WeekFormDto {
    private RecordWeekDo weekDo;
    private List<ProblemDo> problemDos;
    private List<ProjectTimeDo> projectTimeDos;
}

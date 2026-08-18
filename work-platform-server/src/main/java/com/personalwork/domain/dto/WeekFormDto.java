package com.personalwork.domain.dto;

import com.personalwork.domain.entity.ProblemDo;
import com.personalwork.domain.entity.ProjectProgressWeekDo;
import com.personalwork.domain.entity.ProjectTimeDo;
import com.personalwork.domain.entity.RecordWeekDo;
import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 周记录DTO
 * @date 2024/3/15
 */
@Data
public class WeekFormDto {
    private RecordWeekDo weekDo;
    private List<ProblemDo> problemDos;
    private List<ProjectTimeDo> projectTimeDos;
    private List<ProjectProgressWeekDo> projectProgressList;
}

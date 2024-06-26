package com.personalwork.service.impl;

import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.WeekGoalMapper;
import com.personalwork.modal.dto.WeekGoalDto;
import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.query.GoalQueryParam;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/3
 */
@Service
public class WeekGoalServiceImpl extends GoalServiceImpl{
    private final ProjectMapper projectMapper;

    @Autowired
    public WeekGoalServiceImpl(WeekGoalMapper weekGoalMapper, ProjectMapper projectMapper) {
        super(weekGoalMapper);
        this.projectMapper = projectMapper;
    }

    public List<WeekGoalDto> getGoals(GoalQueryParam param) {
        List<? extends GoalDo> goalsDo = goalMapper.list(param);
        List<WeekGoalDto> goalsDto = new ArrayList<>();
        goalsDo.forEach(i -> {
            WeekGoalDto weekGoalDto = new WeekGoalDto();
            BeanUtils.copyProperties(i, weekGoalDto);
            ProjectDo projectDo = projectMapper.getProject(i.getProjectId());
            weekGoalDto.setProject(projectDo);
            goalsDto.add(weekGoalDto);
        });
        return goalsDto;
    }


}

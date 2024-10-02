package com.personalwork.service.impl;

import com.personalwork.dao.MonthGoalMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.modal.dto.MonthGoalDto;
import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.query.GoalQueryParam;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 姚礼林
 * @desc 月目标业务实现类
 * @date 2024/5/4
 */
@Service
public class MonthGoalServiceImpl extends BaseGoalServiceImpl {
    private final ProjectMapper projectMapper;
    private final MonthGoalMapper monthGoalMapper;

    public MonthGoalServiceImpl(MonthGoalMapper goalMapper,ProjectMapper projectMapper) {
        super(goalMapper);
        this.monthGoalMapper = goalMapper;
        this.projectMapper = projectMapper;
    }

    public List<MonthGoalDto> getGoals(GoalQueryParam param) {
        param.setUserId(UserUtil.getLoginUserId());
        List<? extends GoalDo> goalsDo = monthGoalMapper.list(param);
        List<MonthGoalDto> goalsDto = new ArrayList<>();
        goalsDo.forEach(i -> {
            MonthGoalDto monthGoalDto = new MonthGoalDto();
            BeanUtils.copyProperties(i, monthGoalDto);
            ProjectDo projectDo = projectMapper.getProject(i.getProjectId());
            monthGoalDto.setProject(projectDo);
            goalsDto.add(monthGoalDto);
        });
        return goalsDto;
    }
}

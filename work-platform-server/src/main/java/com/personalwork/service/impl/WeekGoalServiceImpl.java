package com.personalwork.service.impl;

import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.WeekGoalMapper;
import com.personalwork.modal.dto.WeekGoalDto;
import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.query.GoalQueryParam;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 姚礼林
 * @desc 周目标业务类
 * @date 2024/5/3
 */
@Service
public class WeekGoalServiceImpl extends BaseGoalServiceImpl {
    private final ProjectMapper projectMapper;
    private final WeekGoalMapper weekGoalMapper;

    @Autowired
    public WeekGoalServiceImpl(WeekGoalMapper weekGoalMapper, ProjectMapper projectMapper) {
        super(weekGoalMapper);
        this.weekGoalMapper = weekGoalMapper;
        this.projectMapper = projectMapper;
    }

    /**
     * 获取周目标列表
     * @param param 条件参数
     * @return 周目标列表
     */
    public List<WeekGoalDto> getGoals(GoalQueryParam param) {
        param.setUserId(UserUtil.getLoginUserId());
        List<? extends GoalDo> goalsDo = weekGoalMapper.list(param);
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

package com.personalwork.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.personalwork.dao.MonthGoalMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.domain.dto.MonthGoalDto;
import com.personalwork.domain.entity.MonthGoalDo;
import com.personalwork.domain.entity.ProjectDo;
import com.personalwork.domain.query.MonthGoalQueryParam;
import com.personalwork.service.GoalService;
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
public class MonthGoalServiceImpl extends ServiceImpl<MonthGoalMapper, MonthGoalDo> implements GoalService {
    private final ProjectMapper projectMapper;

    public MonthGoalServiceImpl(ProjectMapper projectMapper) {
        this.projectMapper = projectMapper;
    }

    public List<MonthGoalDto> getGoals(MonthGoalQueryParam param) {
        param.setUserId(UserUtil.getLoginUserId());
        List<MonthGoalDo> goalsDo = getGoalList(param);
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

    @Override
    public boolean changeState(Integer id, Integer state) {
        return update(new LambdaUpdateWrapper<MonthGoalDo>().eq(MonthGoalDo::getId, id)
                .set(MonthGoalDo::getIsDone, state));
    }

    private List<MonthGoalDo> getGoalList(MonthGoalQueryParam param) {
        param.setUserId(UserUtil.getLoginUserId());
        LambdaQueryWrapper<MonthGoalDo> queryWrapper = new LambdaQueryWrapper<MonthGoalDo>()
                .eq(MonthGoalDo::getUserId, UserUtil.getLoginUserId())
                .orderByDesc(MonthGoalDo::getYear)
                .orderByDesc(MonthGoalDo::getMonth);
        if (param.getYear() != null){
            queryWrapper.eq(MonthGoalDo::getYear, param.getYear());
        }
        if (param.getMonth() != null){
            queryWrapper.eq(MonthGoalDo::getMonth, param.getMonth());
        }
        return list(queryWrapper);
    }
}

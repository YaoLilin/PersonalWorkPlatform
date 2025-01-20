package com.personalwork.service.impl;

import cn.hutool.core.text.CharSequenceUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.WeekGoalMapper;
import com.personalwork.modal.dto.WeekGoalDto;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.WeekGoalDo;
import com.personalwork.modal.query.WeekGoalQueryParam;
import com.personalwork.service.GoalService;
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
public class WeekGoalServiceImpl extends ServiceImpl<WeekGoalMapper, WeekGoalDo> implements GoalService {
    private final ProjectMapper projectMapper;

    @Autowired
    public WeekGoalServiceImpl(ProjectMapper projectMapper) {
        this.projectMapper = projectMapper;
    }

    /**
     * 获取周目标列表
     * @param param 条件参数
     * @return 周目标列表
     */
    public List<WeekGoalDto> getGoals(WeekGoalQueryParam param) {
        List<WeekGoalDo> goalsDo = getGoalList(param);
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

    @Override
    public boolean changeState(Integer id, Integer state) {
        return update(new LambdaUpdateWrapper<WeekGoalDo>().eq(WeekGoalDo::getId, id)
                .set(WeekGoalDo::getIsDone, state));
    }

    public WeekGoalDo getGoalByContent(String weekDate, String content) {
        return  getOne(new LambdaQueryWrapper<WeekGoalDo>()
                .eq(WeekGoalDo::getWeekDate, weekDate)
                .eq(WeekGoalDo::getContent, content));
    }

    private List<WeekGoalDo> getGoalList(WeekGoalQueryParam param) {
        param.setUserId(UserUtil.getLoginUserId());
        LambdaQueryWrapper<WeekGoalDo> queryWrapper = new LambdaQueryWrapper<WeekGoalDo>()
                .eq(WeekGoalDo::getUserId, UserUtil.getLoginUserId())
                .orderByDesc(WeekGoalDo::getWeekDate);
        if (CharSequenceUtil.isNotEmpty(param.getWeekDate())) {
            queryWrapper.eq(WeekGoalDo::getWeekDate, param.getWeekDate());
        }
        return list(queryWrapper);
    }
}

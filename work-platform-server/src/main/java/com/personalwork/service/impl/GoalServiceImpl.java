package com.personalwork.service.impl;

import com.personalwork.dao.GoalMapper;
import com.personalwork.modal.dto.GoalDto;
import com.personalwork.modal.query.GoalParam;
import com.personalwork.modal.query.GoalQueryParam;
import com.personalwork.modal.query.WeekGoalParam;
import com.personalwork.service.GoalService;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/4
 */
public abstract class GoalServiceImpl implements GoalService {
    protected final GoalMapper goalMapper;

    public GoalServiceImpl(GoalMapper goalMapper){
        this.goalMapper = goalMapper;
    }

    @Override
    abstract public List<? extends GoalDto> getGoals(GoalQueryParam param);

    public boolean insertGoal(GoalParam param) {
        return goalMapper.insert(param);
    }

    public boolean changeState(Integer id,Integer state) {
        return goalMapper.changeState(id,state);
    }

    public boolean batchDelete(List<Integer> ids) {
        ids.forEach(goalMapper::delete);
        return true;
    }
}

package com.personalwork.service.impl;

import com.personalwork.dao.GoalMapper;
import com.personalwork.modal.query.GoalParam;
import com.personalwork.service.GoalService;
import com.personalwork.util.UserUtil;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 目标业务类
 * @date 2024/5/4
 */
public class BaseGoalServiceImpl implements GoalService {
    protected final GoalMapper goalMapper;

    protected BaseGoalServiceImpl(GoalMapper goalMapper){
        this.goalMapper = goalMapper;
    }

    @Override
    public boolean insertGoal(GoalParam param) {
        param.setUserId(UserUtil.getLoginUserId());
        return goalMapper.insert(param);
    }

    @Override
    public boolean changeState(Integer id, Integer state) {
        return goalMapper.changeState(id,state);
    }

    @Override
    public boolean batchDelete(List<Integer> ids) {
        ids.forEach(goalMapper::delete);
        return true;
    }
}

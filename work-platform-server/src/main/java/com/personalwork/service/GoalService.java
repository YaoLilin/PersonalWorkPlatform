package com.personalwork.service;

import com.personalwork.modal.dto.GoalDto;
import com.personalwork.modal.dto.WeekGoalDto;
import com.personalwork.modal.query.GoalParam;
import com.personalwork.modal.query.GoalQueryParam;
import com.personalwork.modal.query.WeekGoalParam;
import com.personalwork.modal.query.WeekGoalQueryParam;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/4
 */
public interface GoalService {

    List<? extends GoalDto> getGoals(GoalQueryParam param);

    boolean insertGoal(GoalParam param);

    boolean changeState(Integer id, Integer state);

    boolean batchDelete(List<Integer> ids);
}

package com.personalwork.service;

import com.personalwork.modal.query.GoalParam;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/4
 */
public interface GoalService {

    boolean insertGoal(GoalParam param);

    boolean changeState(Integer id, Integer state);

    boolean batchDelete(List<Integer> ids);
}

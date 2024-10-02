package com.personalwork.dao;

import com.personalwork.modal.query.GoalParam;

/**
 * @author 姚礼林
 * @desc 目标Mapper
 * @date 2024/5/4
 */
public interface GoalMapper {
    boolean insert(GoalParam param);
    boolean changeState(Integer id,Integer state);
    boolean delete(Integer id);
}

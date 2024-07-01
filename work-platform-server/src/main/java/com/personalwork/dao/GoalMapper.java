package com.personalwork.dao;

import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.query.GoalParam;
import com.personalwork.modal.query.GoalQueryParam;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 目标Mapper
 * @date 2024/5/4
 */
public interface GoalMapper {
    List<? extends GoalDo> list(GoalQueryParam param);

    boolean insert(GoalParam param);
    boolean changeState(Integer id,Integer state);

    boolean delete(Integer id);
}

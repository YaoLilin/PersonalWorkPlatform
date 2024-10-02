package com.personalwork.dao;

import com.personalwork.modal.entity.WeekGoalDo;
import com.personalwork.modal.query.GoalQueryParam;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/3
 */
@Repository
@Mapper
public interface WeekGoalMapper extends GoalMapper{
    List<WeekGoalDo> list(GoalQueryParam param);
}

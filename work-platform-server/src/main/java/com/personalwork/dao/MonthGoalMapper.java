package com.personalwork.dao;

import com.personalwork.modal.entity.MonthGoalDo;
import com.personalwork.modal.query.GoalQueryParam;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 获取月目标数据
 * @date 2024/5/4
 */
@Repository
@Mapper
public interface MonthGoalMapper extends GoalMapper{
    List<MonthGoalDo> list(GoalQueryParam param);
}

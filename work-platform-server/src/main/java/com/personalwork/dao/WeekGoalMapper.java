package com.personalwork.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personalwork.domain.entity.WeekGoalDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

/**
 * @author 姚礼林
 * @desc 周目标Mapper
 * @date 2024/5/3
 */
@Repository
@Mapper
public interface WeekGoalMapper extends BaseMapper<WeekGoalDo> {
}

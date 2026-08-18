package com.personalwork.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personalwork.domain.entity.MonthGoalDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

/**
 * @author 姚礼林
 * @desc 获取月目标数据
 * @date 2024/5/4
 */
@Repository
@Mapper
public interface MonthGoalMapper extends BaseMapper<MonthGoalDo> {
}

package com.personalwork.dao;

import com.personalwork.modal.dto.WeekTimeCountDto;
import com.personalwork.modal.query.TimeCountChartParam;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 每周利用时间统计mapper
 * @date 2024/7/9
 */
@Repository
@Mapper
public interface WorkTimeCountMapper {
    List<WeekTimeCountDto> listByDateRange(TimeCountChartParam param);
}

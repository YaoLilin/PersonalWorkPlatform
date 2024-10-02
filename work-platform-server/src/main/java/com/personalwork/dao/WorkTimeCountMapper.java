package com.personalwork.dao;

import com.personalwork.modal.dto.ProjectWeekTimeDto;
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
    /**
     * 按时间范围获取项目的每周时间统计
     * @param param 条件参数
     * @return 项目的每周时间统计集合
     */
    List<ProjectWeekTimeDto> listByDateRange(TimeCountChartParam param);
}

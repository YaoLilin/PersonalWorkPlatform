package com.personalwork.dao;

import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 周的项目占用时间统计表持久化映射
 * @date 2023/8/27
 */
@Repository
@Mapper
public interface WeekProjectTimeCountMapper {
    List<WeekProjectTimeCountDo> listByWeekId(Integer weekId);
    List<WeekProjectTimeCountDo> listByProjectId(Integer projectId);
    boolean add(WeekProjectTimeCountDo timeCount);
    boolean delete(Integer week);

    boolean deleteByProjectId(Integer projectId);

}

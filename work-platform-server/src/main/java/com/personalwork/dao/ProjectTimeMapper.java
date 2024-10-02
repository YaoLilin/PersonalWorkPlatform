package com.personalwork.dao;

import com.personalwork.modal.entity.ProjectTimeDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/6/11
 */
@Repository
@Mapper
public interface ProjectTimeMapper {
    boolean insert(ProjectTimeDo projectTimeDo);
    boolean update(ProjectTimeDo projectTimeDo);
    boolean deleteWeekProjectTime(Integer weekId);

    boolean deleteByProjectId(Integer projectId);
    List<ProjectTimeDo> getProjectTimeByDate(Integer projectId, String date);
    List<ProjectTimeDo> getProjectTimeByProjectId(int projectId);
    List<ProjectTimeDo> getProjectTimeByWeek(Integer weekId);
    List<ProjectTimeDo> list(Integer userId);
    List<ProjectTimeDo> getProjectTimesByRange(String startDate,String endDate,Integer userId);
}

package com.personalwork.dao;

import com.personalwork.domain.dto.ChecklistScheduleTimeDto;
import com.personalwork.domain.entity.ProjectTimeDo;
import com.personalwork.domain.vo.ScheduleEventVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
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
    List<ScheduleEventVo> listScheduleByUser(Integer userId);
    List<ChecklistScheduleTimeDto> listChecklistScheduleTimesByUser(Integer userId);
    ProjectTimeDo getScheduleById(Integer id, Integer userId);
    boolean updateSchedule(ProjectTimeDo projectTimeDo);
    boolean updateScheduleNameByChecklistId(@Param("checklistId") Integer checklistId,
                                            @Param("scheduleName") String scheduleName);
    boolean clearChecklistIdByChecklistId(@Param("checklistId") Integer checklistId);
    boolean deleteScheduleById(Integer id, Integer userId);
    List<ProjectTimeDo> getProjectTimesByWeekRange(String startDate, String endDate, Integer userId);
    List<ProjectTimeDo> getProjectTimesByRange(String startDate,String endDate,Integer userId);
}

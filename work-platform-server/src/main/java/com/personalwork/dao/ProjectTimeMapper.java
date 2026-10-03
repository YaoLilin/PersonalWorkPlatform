package com.personalwork.dao;

import com.personalwork.domain.dto.ChecklistScheduleTimeDto;
import com.personalwork.domain.entity.ProjectTimeDo;
import com.personalwork.domain.vo.ScheduleEventVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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
    /**
     * 批量读取用户日程及其清单信息，每条查询最多关联三张表。
     *
     * @param userId 用户编号
     * @return 完整的日程列表
     */
    default List<ScheduleEventVo> listScheduleByUser(Integer userId) {
        List<ScheduleEventVo> events = listScheduleBaseByUser(userId);
        List<Integer> checklistIds = events.stream().map(ScheduleEventVo::getChecklistId)
                .filter(Objects::nonNull).distinct().toList();
        if (checklistIds.isEmpty()) {
            return events;
        }
        // key: 清单编号；value: 清单及关联项目、类型信息。
        final int maxChecklistIdsPerQuery = 1000;
        List<ScheduleEventVo> details = new ArrayList<>(checklistIds.size());
        for (int offset = 0; offset < checklistIds.size(); offset += maxChecklistIdsPerQuery) {
            int batchEnd = Math.min(offset + maxChecklistIdsPerQuery, checklistIds.size());
            details.addAll(listChecklistDetailsByIds(checklistIds.subList(offset, batchEnd)));
        }
        Map<Integer, ScheduleEventVo> detailsById = new HashMap<>(details.size());
        for (ScheduleEventVo detail : details) {
            detailsById.put(detail.getChecklistId(), detail);
        }
        for (ScheduleEventVo event : events) {
            ScheduleEventVo detail = detailsById.get(event.getChecklistId());
            if (detail != null) {
                event.setChecklistName(detail.getChecklistName());
                event.setChecklistProjectId(detail.getChecklistProjectId());
                event.setChecklistProjectName(detail.getChecklistProjectName());
                event.setChecklistTypeColor(detail.getChecklistTypeColor());
                event.setChecklistIsDone(detail.getChecklistIsDone());
            }
        }
        return events;
    }

    /**
     * 查询用户日程的基础字段与直接关联的项目。
     *
     * @param userId 用户编号
     * @return 日程基础数据
     */
    List<ScheduleEventVo> listScheduleBaseByUser(@Param("userId") Integer userId);

    /**
     * 批量查询日程所引用的清单、清单项目和清单类型。
     *
     * @param checklistIds 清单编号
     * @return 清单补充数据
     */
    List<ScheduleEventVo> listChecklistDetailsByIds(@Param("checklistIds") List<Integer> checklistIds);
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

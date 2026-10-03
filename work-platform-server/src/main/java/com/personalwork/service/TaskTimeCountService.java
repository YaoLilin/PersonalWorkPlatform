package com.personalwork.service;

import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.domain.dto.TaskTimeDto;
import com.personalwork.domain.vo.ScheduleEventVo;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>按时间范围汇总日程所属项目或清单的消费时间。</p>
 */
@Service
@RequiredArgsConstructor
public class TaskTimeCountService {
    private final ProjectTimeMapper projectTimeMapper;

    /**
     * <p>读取当前用户的日程，供多个统计周期复用。</p>
     *
     * @return 当前用户的日程
     */
    public List<ScheduleEventVo> listEvents() {
        return projectTimeMapper.listScheduleByUser(UserUtil.getLoginUserId());
    }

    /**
     * <p>计算与指定日期范围重叠的日程分钟数，结束日期不包含在范围内。</p>
     *
     * @param events 当前用户的日程
     * @param start  开始日期
     * @param end    结束日期，不包含当日
     * @return 按项目或清单汇总的时间
     */
    public List<TaskTimeDto> count(List<ScheduleEventVo> events, LocalDate start, LocalDate end) {
        Map<String, TaskTimeDto> counts = new HashMap<>(events.size());
        LocalDateTime rangeStart = start.atStartOfDay();
        LocalDateTime rangeEnd = end.atStartOfDay();
        for (ScheduleEventVo event : events) {
            int minutes = overlapMinutes(event, rangeStart, rangeEnd);
            if (minutes == 0) {
                continue;
            }
            TaskTimeDto task = toTaskTime(event, minutes);
            if (task == null) {
                continue;
            }
            String key = (task.isChecklist() ? "checklist:" : "project:") + task.id();
            counts.merge(key, task,
                    (current, added) -> new TaskTimeDto(current.id(), current.name(),
                            current.minutes() + added.minutes(), current.isChecklist()));
        }
        return new ArrayList<>(counts.values());
    }

    /**
     * <p>按统计图口径计算时间：关联项目的清单计入项目，独立清单单独展示。</p>
     *
     * @param events 当前用户的日程
     * @param start  开始日期
     * @param end    结束日期，不包含当日
     * @return 按项目或独立清单汇总的时间
     */
    public List<TaskTimeDto> countForChart(List<ScheduleEventVo> events, LocalDate start, LocalDate end) {
        return count(events, start, end);
    }

    private int overlapMinutes(ScheduleEventVo event, LocalDateTime rangeStart, LocalDateTime rangeEnd) {
        LocalDateTime eventStart = LocalDateTime.of(LocalDate.parse(event.getDate()),
                LocalTime.parse(event.getStartTime()));
        LocalDateTime eventEnd = LocalDateTime.of(LocalDate.parse(event.getEndDate() == null
                ? event.getDate() : event.getEndDate()), LocalTime.parse(event.getEndTime()));
        if (!eventEnd.isAfter(eventStart)) {
            eventEnd = eventEnd.plusDays(1);
        }
        LocalDateTime overlapStart = eventStart.isAfter(rangeStart) ? eventStart : rangeStart;
        LocalDateTime overlapEnd = eventEnd.isBefore(rangeEnd) ? eventEnd : rangeEnd;
        return overlapEnd.isAfter(overlapStart)
                ? Math.toIntExact(Duration.between(overlapStart, overlapEnd).toMinutes()) : 0;
    }

    private TaskTimeDto toTaskTime(ScheduleEventVo event, int minutes) {
        boolean linkedChecklist = event.getChecklistId() != null && event.getChecklistProjectId() != null;
        boolean isChecklist = event.getChecklistId() != null && !linkedChecklist;
        Integer id = isChecklist ? event.getChecklistId() : linkedChecklist
                ? event.getChecklistProjectId() : event.getProjectId();
        if (id == null) {
            return null;
        }
        String name = isChecklist ? event.getChecklistName() : linkedChecklist
                ? event.getChecklistProjectName() : event.getProjectName();
        return new TaskTimeDto(id, name, minutes, isChecklist);
    }
}

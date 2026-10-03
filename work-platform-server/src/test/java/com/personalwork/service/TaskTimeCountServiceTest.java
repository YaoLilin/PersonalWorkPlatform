package com.personalwork.service;

import com.personalwork.domain.dto.TaskTimeDto;
import com.personalwork.domain.vo.ScheduleEventVo;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** <p>项目和清单时间汇总测试。</p> */
class TaskTimeCountServiceTest {
    private final TaskTimeCountService service = new TaskTimeCountService(null);

    @Test
    void countsChecklistAndProjectAcrossWeekAndMonthBoundaries() {
        ScheduleEventVo checklist = event(1, "收集箱", 7, "清单 A", null,
                "2026-09-30", "2026-10-01", "23:00", "01:00");
        ScheduleEventVo projectChecklist = event(2, "收集箱", 8, "清单 B", 2,
                "2026-10-01", "2026-10-01", "09:00", "10:00");
        projectChecklist.setChecklistProjectName("项目 B");
        ScheduleEventVo inboxProject = event(2, "收集箱", 9, "不应使用的清单名", 2,
                "2026-10-01", "2026-10-01", "10:00", "11:00");
        inboxProject.setChecklistId(null);
        List<ScheduleEventVo> events = List.of(checklist, projectChecklist, inboxProject);

        List<TaskTimeDto> september = service.count(events,
                LocalDate.parse("2026-09-01"), LocalDate.parse("2026-10-01"));
        assertEquals(1, september.size());
        assertEquals(60, september.get(0).minutes());
        assertTrue(september.get(0).isChecklist());

        List<TaskTimeDto> october = service.count(events,
                LocalDate.parse("2026-10-01"), LocalDate.parse("2026-11-01"));
        assertEquals(2, october.size());
        assertTrue(october.stream().anyMatch(item -> item.name().equals("清单 A") && item.isChecklist()));
        assertTrue(october.stream().anyMatch(item -> item.id() == 2 && item.name().equals("项目 B")
                && !item.isChecklist() && item.minutes() == 120));
        assertEquals(180, october.stream().mapToInt(TaskTimeDto::minutes).sum());
    }

    @Test
    void countsLegacyOvernightScheduleWithoutEndDateOnBothDays() {
        ScheduleEventVo schedule = event(1, "项目 A", 0, "", null,
                "2026-09-30", null, "23:00", "01:00");
        schedule.setChecklistId(null);

        List<TaskTimeDto> september = service.count(List.of(schedule),
                LocalDate.parse("2026-09-01"), LocalDate.parse("2026-10-01"));
        List<TaskTimeDto> october = service.count(List.of(schedule),
                LocalDate.parse("2026-10-01"), LocalDate.parse("2026-11-01"));

        assertEquals(60, september.get(0).minutes());
        assertEquals(60, october.get(0).minutes());
    }

    @Test
    void chartMergesLinkedChecklistIntoItsProjectAndKeepsIndependentChecklistSeparate() {
        ScheduleEventVo linked = event(1, "收集箱", 11, "骑行训练", 2,
                "2026-09-22", "2026-09-22", "12:30", "15:00");
        linked.setChecklistProjectName("骑行训练项目");
        ScheduleEventVo direct = event(2, "骑行训练项目", 0, "", null,
                "2026-09-22", "2026-09-22", "15:00", "16:00");
        direct.setChecklistId(null);
        ScheduleEventVo independent = event(1, "收集箱", 3, "骑行训练", null,
                "2026-09-22", "2026-09-22", "16:00", "16:30");

        List<TaskTimeDto> result = service.countForChart(
                List.of(linked, direct, independent), LocalDate.parse("2026-09-01"), LocalDate.parse("2026-10-01"));

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(task -> task.id() == 2 && !task.isChecklist()
                && task.name().equals("骑行训练项目") && task.minutes() == 210));
        assertTrue(result.stream().anyMatch(task -> task.id() == 3 && task.isChecklist()
                && task.minutes() == 30));
        assertFalse(result.stream().anyMatch(task -> task.id() == 11));
    }

    private ScheduleEventVo event(int projectId, String projectName, int checklistId, String checklistName,
                                  Integer checklistProjectId, String date, String endDate, String startTime,
                                  String endTime) {
        ScheduleEventVo event = new ScheduleEventVo();
        event.setProjectId(projectId);
        event.setProjectName(projectName);
        event.setChecklistId(checklistId);
        event.setChecklistName(checklistName);
        event.setChecklistProjectId(checklistProjectId);
        event.setDate(date);
        event.setEndDate(endDate);
        event.setStartTime(startTime);
        event.setEndTime(endTime);
        return event;
    }
}

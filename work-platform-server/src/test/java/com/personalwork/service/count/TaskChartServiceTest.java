package com.personalwork.service.count;

import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.domain.dto.MonthRecordDto;
import com.personalwork.domain.dto.TaskTimeDto;
import com.personalwork.domain.dto.WeekTimeCountDto;
import com.personalwork.domain.entity.RecordMonthDo;
import com.personalwork.domain.entity.RecordWeekDo;
import com.personalwork.domain.query.TimeCountChartParam;
import com.personalwork.domain.vo.BarChartVo;
import com.personalwork.domain.vo.PieCountVo;
import com.personalwork.service.TaskTimeCountService;
import com.personalwork.service.count.manage.MonthRecordManager;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** <p>项目和清单统计图测试。</p> */
class TaskChartServiceTest {
    private final TaskTimeCountService taskTimeCountService = mock(TaskTimeCountService.class);
    private final WeekWorkTimeCountService weekWorkTimeCountService = mock(WeekWorkTimeCountService.class);
    private final MonthRecordManager monthRecordManager = mock(MonthRecordManager.class);
    private final RecordWeekMapper recordWeekMapper = mock(RecordWeekMapper.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-10-03T00:00:00Z"), ZoneOffset.UTC);
    private final TaskChartService service = new TaskChartService(
            taskTimeCountService, weekWorkTimeCountService, monthRecordManager, recordWeekMapper, clock);

    @Test
    void keepsSameNamedProjectAndChecklistSeparateInMonthChart() {
        TimeCountChartParam param = new TimeCountChartParam();
        when(monthRecordManager.getMonthRecordList(param)).thenReturn(List.of(month(2026, 9,
                task(1, "健身", 60, false), task(7, "健身", 120, true))));

        List<BarChartVo.Item> items = service.monthTimeCount(param).get(0).items();

        assertEquals(2, items.size());
        assertEquals("project:1", items.get(0).key());
        assertFalse(items.get(0).isChecklist());
        assertEquals("checklist:7", items.get(1).key());
        assertTrue(items.get(1).isChecklist());
        verify(taskTimeCountService, never()).listEvents();
        verify(taskTimeCountService, never()).countForChart(any(), any(), any());
    }

    @Test
    void keepsChecklistAndSumsItsTimeAcrossMonthsWhenProjectsAreFiltered() {
        TimeCountChartParam param = new TimeCountChartParam();
        param.setProjects(List.of(2));
        when(monthRecordManager.getMonthRecordList(param)).thenReturn(List.of(
                month(2026, 8, task(1, "健身", 60, false), task(7, "健身", 60, true)),
                month(2026, 9, task(7, "健身", 120, true))));

        List<PieCountVo> items = service.workTimeProportionCount(param);

        assertEquals(1, items.size());
        assertEquals("健身", items.get(0).getName());
        assertEquals("checklist:7", items.get(0).getKey());
        assertTrue(items.get(0).getChecklist());
        assertEquals(3.0, items.get(0).getCount());
        verify(taskTimeCountService, never()).listEvents();
        verify(taskTimeCountService, never()).countForChart(any(), any(), any());
    }

    @Test
    void filtersWeeklyChartByProjectIdAndKeepsIndependentChecklist() {
        TimeCountChartParam param = new TimeCountChartParam();
        param.setProjects(List.of(2));
        RecordWeekDo week = new RecordWeekDo();
        week.setDate("2026-09-21");
        when(weekWorkTimeCountService.weekWorkTimeCount(any())).thenAnswer(invocation -> {
            TimeCountChartParam range = invocation.getArgument(0);
            range.setStartDate("2026-09-21");
            range.setEndDate("2026-09-21");
            range.setUserId(1);
            return List.of(new WeekTimeCountDto(week, List.of()));
        });
        when(taskTimeCountService.listEvents()).thenReturn(List.of());
        when(taskTimeCountService.countForChart(any(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(task(1, "健身", 60, false), task(7, "健身", 120, true)));

        List<BarChartVo.Item> items = service.weekTimeCount(param).get(0).items();

        assertEquals(1, items.size());
        assertEquals("checklist:7", items.get(0).key());
        assertEquals(2.0, items.get(0).value());
    }

    @Test
    void includesWeekWithOnlyIndependentChecklistInCustomRange() {
        TimeCountChartParam param = new TimeCountChartParam();
        RecordWeekDo week = new RecordWeekDo();
        week.setDate("2026-09-21");
        when(weekWorkTimeCountService.weekWorkTimeCount(any())).thenAnswer(invocation -> {
            TimeCountChartParam range = invocation.getArgument(0);
            range.setStartDate("2026-09-21");
            range.setEndDate("2026-09-21");
            range.setUserId(1);
            return List.of();
        });
        when(recordWeekMapper.getWorkWeekList(1)).thenReturn(List.of(week));
        when(taskTimeCountService.countForChart(any(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(task(7, "独立清单", 60, true)));

        List<BarChartVo> result = service.weekTimeCount(param);

        assertEquals(1, result.size());
        assertEquals("checklist:7", result.get(0).items().get(0).key());
    }

    private MonthRecordDto month(int year, int month, TaskTimeDto... tasks) {
        RecordMonthDo record = new RecordMonthDo();
        record.setYear(year);
        record.setMonth(month);
        MonthRecordDto result = new MonthRecordDto();
        result.setRecordMonthDo(record);
        result.setTaskTimeList(List.of(tasks));
        return result;
    }

    private TaskTimeDto task(int id, String name, int minutes, boolean isChecklist) {
        return new TaskTimeDto(id, name, minutes, isChecklist);
    }
}

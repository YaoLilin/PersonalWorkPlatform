package com.personalwork.service;

import com.personalwork.base.TestSetUp;
import com.personalwork.dao.ChecklistMapper;
import com.personalwork.dao.ChecklistTypeMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.domain.entity.ChecklistDo;
import com.personalwork.domain.entity.ProjectTimeDo;
import com.personalwork.domain.entity.RecordWeekDo;
import com.personalwork.domain.query.ScheduleEventParam;
import com.personalwork.domain.vo.ScheduleEventVo;
import com.personalwork.exception.MethodParamInvalidException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

/**
 * 验证无关联项目的日程可保存及返回。
 */
class ScheduleServiceTest extends TestSetUp {

    @Mock private ProjectTimeMapper projectTimeMapper;
    @Mock private ProjectMapper projectMapper;
    @Mock private ChecklistMapper checklistMapper;
    @Mock private ChecklistTypeMapper checklistTypeMapper;
    @Mock private WeekFormService weekFormService;
    @InjectMocks private ScheduleService scheduleService;

    @Test
    void createsScheduleWithoutInboxProject() {
        ScheduleEventParam param = new ScheduleEventParam();
        param.setScheduleName("自由日程");
        param.setDate("2026-10-02");
        param.setEndDate("2026-10-02");
        param.setStartTime("09:00");
        param.setEndTime("10:00");
        param.setCreateChecklist(true);
        RecordWeekDo week = new RecordWeekDo();
        week.setId(3);
        when(weekFormService.ensureWeekForm(any(LocalDate.class))).thenReturn(week);
        doAnswer(invocation -> {
            ChecklistDo checklist = invocation.getArgument(0);
            checklist.setId(5);
            return true;
        }).when(checklistMapper).insert(any(ChecklistDo.class));
        doAnswer(invocation -> {
            ProjectTimeDo schedule = invocation.getArgument(0);
            schedule.setId(7);
            return true;
        }).when(projectTimeMapper).insert(any(ProjectTimeDo.class));
        when(projectTimeMapper.getScheduleById(eq(7), eq(1)))
                .thenAnswer(invocation -> {
                    ArgumentCaptor<ProjectTimeDo> saved = ArgumentCaptor.forClass(ProjectTimeDo.class);
                    verify(projectTimeMapper).insert(saved.capture());
                    return saved.getValue();
                });

        ScheduleEventVo result = scheduleService.createSchedule(param);

        assertEquals(7, result.getId());
        assertNull(result.getProjectId());
        assertEquals(5, result.getChecklistId());
        assertEquals("自由日程", result.getScheduleName());
        verify(checklistMapper).insert(org.mockito.ArgumentMatchers.argThat(
                checklist -> checklist.getProjectId() == null));
        verify(projectMapper, org.mockito.Mockito.never()).getProjectByName(any(), any());
        verify(weekFormService).recalculateWeekProjectTime(LocalDate.of(2026, 9, 28));
    }

    @Test
    void rejectsScheduleWithoutChecklistEvenWhenProjectIsSelected() {
        ScheduleEventParam param = validParam();
        param.setProjectId(2);

        assertThrows(MethodParamInvalidException.class, () -> scheduleService.createSchedule(param));

        verify(projectTimeMapper, never()).insert(any(ProjectTimeDo.class));
        verify(checklistMapper, never()).insert(any(ChecklistDo.class));
    }

    @Test
    void updatesExistingScheduleWithoutChecklistOrProject() {
        ScheduleEventParam param = validParam();
        param.setScheduleName("修改后的日程");
        ProjectTimeDo existing = new ProjectTimeDo();
        existing.setId(7);
        existing.setDate("2026-10-02");
        existing.setEndDate("2026-10-02");
        existing.setStartTime("09:00");
        existing.setEndTime("10:00");
        RecordWeekDo week = new RecordWeekDo();
        week.setId(3);
        when(weekFormService.ensureWeekForm(any(LocalDate.class))).thenReturn(week);
        when(projectTimeMapper.getScheduleById(7, 1)).thenReturn(existing).thenAnswer(invocation -> {
            ArgumentCaptor<ProjectTimeDo> updated = ArgumentCaptor.forClass(ProjectTimeDo.class);
            verify(projectTimeMapper).updateSchedule(updated.capture());
            return updated.getValue();
        });

        ScheduleEventVo result = scheduleService.updateSchedule(7, param);

        assertEquals(7, result.getId());
        assertEquals("修改后的日程", result.getScheduleName());
        assertNull(result.getProjectId());
        assertNull(result.getChecklistId());
        verify(projectTimeMapper).updateSchedule(org.mockito.ArgumentMatchers.argThat(schedule ->
                schedule.getId() == 7 && schedule.getProjectId() == null && schedule.getChecklistId() == null));
        verify(checklistMapper, never()).insert(any(ChecklistDo.class));
    }

    @Test
    void updateCanCreateChecklistWithoutProject() {
        ScheduleEventParam param = validParam();
        param.setCreateChecklist(true);
        ProjectTimeDo existing = new ProjectTimeDo();
        existing.setDate("2026-10-02");
        existing.setEndDate("2026-10-02");
        existing.setStartTime("09:00");
        existing.setEndTime("10:00");
        when(projectTimeMapper.getScheduleById(7, 1)).thenReturn(existing);
        RecordWeekDo week = new RecordWeekDo();
        week.setId(3);
        when(weekFormService.ensureWeekForm(any(LocalDate.class))).thenReturn(week);
        doAnswer(invocation -> {
            ChecklistDo checklist = invocation.getArgument(0);
            checklist.setId(5);
            return true;
        }).when(checklistMapper).insert(any(ChecklistDo.class));

        scheduleService.updateSchedule(7, param);

        verify(projectTimeMapper).updateSchedule(org.mockito.ArgumentMatchers.argThat(schedule ->
                schedule.getProject() == null && Integer.valueOf(5).equals(schedule.getChecklistId())));
    }

    private ScheduleEventParam validParam() {
        ScheduleEventParam param = new ScheduleEventParam();
        param.setScheduleName("自由日程");
        param.setDate("2026-10-02");
        param.setEndDate("2026-10-02");
        param.setStartTime("09:00");
        param.setEndTime("10:00");
        return param;
    }
}

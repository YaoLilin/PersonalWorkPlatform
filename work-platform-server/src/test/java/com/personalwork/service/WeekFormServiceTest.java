package com.personalwork.service;

import com.personalwork.base.TestSetUp;
import com.personalwork.constants.Mark;
import com.personalwork.dao.*;
import com.personalwork.domain.dto.WeekFormDto;
import com.personalwork.domain.entity.ProblemDo;
import com.personalwork.domain.entity.ProjectTimeDo;
import com.personalwork.domain.entity.RecordWeekDo;
import com.personalwork.domain.query.WeekFormParam;
import com.personalwork.exception.ProblemAddException;
import com.personalwork.util.RedisUtil;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WeekFormServiceTest extends TestSetUp {

    @Mock
    private ProjectTimeMapper projectTimeMapper;
    @Mock
    private ProjectMapper projectMapper;
    @Mock
    private RecordWeekMapper recordWeekMapper;
    @Mock
    private WeekProjectTimeCountMapper countMapper;
    @Mock
    private ProblemMapper problemMapper;
    @Mock
    private MonthCountService monthCountService;
    @Mock
    private RedisUtil redisUtil;
    @Mock
    private ProjectProgressWeekService projectProgressWeekService;

    @InjectMocks
    private WeekFormService weekFormService;

    @Test
    void countsScheduleWithoutProjectInWeekTotal() {
        RecordWeekDo week = new RecordWeekDo();
        week.setId(3);
        ProjectTimeDo schedule = new ProjectTimeDo();
        schedule.setDate("2026-10-02");
        schedule.setEndDate("2026-10-02");
        schedule.setStartTime("09:00");
        schedule.setEndTime("10:00");
        when(recordWeekMapper.getWorkWeekByDate("2026-09-28", 1)).thenReturn(week);
        when(projectTimeMapper.getProjectTimesByWeekRange("2026-09-28", "2026-10-05", 1))
                .thenReturn(List.of(schedule));

        weekFormService.recalculateWeekProjectTime(java.time.LocalDate.of(2026, 9, 28));

        verify(recordWeekMapper).updateWorkWeek(argThat(record -> record.getTime() == 60));
        verify(countMapper, never()).add(any());
    }


    @Test
    void testCreateForm() {
        WeekFormParam param = getWeekFormParam();
        RecordWeekDo recordWeekDo = getRecordWeekDo();
        when(recordWeekMapper.getWorkWeekByDate(anyString(), anyInt())).thenReturn(recordWeekDo);
        when(recordWeekMapper.addWorkWeek(any(RecordWeekDo.class))).thenReturn(true);
        when(problemMapper.getOpenProblemByName(anyString(), anyInt())).thenReturn(null);

        Integer id = weekFormService.createForm(param);

        verify(recordWeekMapper, times(1)).addWorkWeek(any(RecordWeekDo.class));
        verify(problemMapper, times(1)).getOpenProblemByName(anyString(), anyInt());
        verify(monthCountService, times(1)).countMonthProjectTime(anyInt(), anyInt());
        assertNotNull(id);
    }

    @Test
    void testCreateFormWithExistingProblem() {
        RecordWeekDo weekDo = new RecordWeekDo();
        weekDo.setId(1);

        WeekFormParam param = getWeekFormParam();
        when(problemMapper.getOpenProblemByName(anyString(), anyInt())).thenReturn(new ProblemDo());
        when(recordWeekMapper.getWorkWeekByDate(any(), anyInt())).thenReturn(weekDo);

        assertThrows(ProblemAddException.class, () -> weekFormService.createForm(param));
    }

    @Test
    void testSaveForm() {
        Integer id = 1;
        WeekFormParam param = getWeekFormParam();
        when(recordWeekMapper.updateWorkWeek(any(RecordWeekDo.class))).thenReturn(true);
        boolean result = weekFormService.saveForm(id, param);
        verify(recordWeekMapper, times(1)).updateWorkWeek(any(RecordWeekDo.class));
        verify(monthCountService, times(1)).countMonthProjectTime(anyInt(), anyInt());
        assertTrue(result);
    }

    @Test
    void testSaveFormPreservesScheduleTimes() {
        WeekFormParam param = getWeekFormParam();
        param.setPreserveScheduleTimes(true);
        when(recordWeekMapper.getWorkWeekById(1)).thenReturn(getRecordWeekDo());

        assertTrue(weekFormService.saveForm(1, param));

        ArgumentCaptor<RecordWeekDo> savedWeek = ArgumentCaptor.forClass(RecordWeekDo.class);
        verify(recordWeekMapper).updateWorkWeek(savedWeek.capture());
        assertEquals(180, savedWeek.getValue().getTime());
        verify(projectTimeMapper, never()).deleteWeekProjectTime(anyInt());
        verify(projectTimeMapper, never()).insert(any(ProjectTimeDo.class));
        verify(countMapper, never()).deleteByWeek(anyInt());
        verify(countMapper, never()).add(any());
    }

    @Test
    void testSaveFormWithExistingProblem() {
        Integer id = 1;
        WeekFormParam param = getWeekFormParam();
        when(problemMapper.getOpenProblemByName(anyString(), anyInt())).thenReturn(new ProblemDo());

        assertThrows(ProblemAddException.class, () -> weekFormService.saveForm(id, param));
    }

    @Test
    void testGetWeekForm() {
        Integer weekId = 1;
        RecordWeekDo recordWeekDo = getRecordWeekDo();
        List<ProjectTimeDo> projectTimeDoList = Collections.emptyList();
        List<ProblemDo> problemDos = Collections.emptyList();
        when(recordWeekMapper.getWorkWeekById(weekId)).thenReturn(recordWeekDo);
        when(projectTimeMapper.getProjectTimeByWeek(weekId)).thenReturn(projectTimeDoList);
        when(problemMapper.getProblemsByWeekDate(anyString(), anyInt())).thenReturn(problemDos);

        WeekFormDto weekFormDto = weekFormService.getWeekForm(weekId);

        verify(recordWeekMapper, times(1)).getWorkWeekById(weekId);
        assertNotNull(weekFormDto);
        assertEquals(recordWeekDo, weekFormDto.getWeekDo());
        assertEquals(problemDos, weekFormDto.getProblemDos());
        assertEquals(projectTimeDoList, weekFormDto.getProjectTimeDos());
    }

    @Test
    void testIsExist() {
        String date = "2023-08-26";
        when(recordWeekMapper.getWorkWeekByDate(anyString(), anyInt())).thenReturn(new RecordWeekDo());

        boolean result = weekFormService.isExist(date);

        verify(recordWeekMapper, times(1)).getWorkWeekByDate(anyString(), anyInt());
        assertTrue(result);
    }

    @Test
    void testDelete() {
        int weekId = 1;
        when(recordWeekMapper.deleteWorkWeek(anyInt())).thenReturn(true);

        boolean result = weekFormService.delete(weekId);

        verify(recordWeekMapper, times(1)).deleteWorkWeek(weekId);
        assertTrue(result);
    }

    private WeekFormParam getWeekFormParam() {
        WeekFormParam.TaskCountItem taskCountItem = new WeekFormParam.TaskCountItem();
        taskCountItem.setProject(1);
        taskCountItem.setMinutes(120);
        WeekFormParam.TaskCount paramTaskCount = new WeekFormParam.TaskCount();
        paramTaskCount.setTotalMinutes(120);
        paramTaskCount.setItems(List.of(taskCountItem));
        WeekFormParam.Problem problem = new WeekFormParam.Problem();
        problem.setTitle("Problem 1");
        WeekFormParam.Problem addProblem = new WeekFormParam.Problem();
        addProblem.setTitle("Problem 2");
        List<WeekFormParam.Problem> problems = List.of(problem);
        WeekFormParam.ProjectTime projectTime = new WeekFormParam.ProjectTime();
        projectTime.setProject(1);
        projectTime.setStartTime("12:00");
        projectTime.setEndTime("14:00");
        projectTime.setDate("2024-04-12");

        WeekFormParam param = new WeekFormParam();
        param.setProjectTimeList(List.of(projectTime));
        param.setTaskCount(paramTaskCount);
        param.setProblems(problems);
        param.setAddProblems(List.of(addProblem));
        param.setDate("2024-04-12");
        param.setMark(Mark.UNQUALIFIED);
        param.setSummary("Test Summary");
        return param;
    }

    private RecordWeekDo getRecordWeekDo() {
        RecordWeekDo recordWeekDo = new RecordWeekDo();
        recordWeekDo.setDate("2023-08-26");
        recordWeekDo.setTime(180);
        recordWeekDo.setMark(Mark.UNQUALIFIED);
        recordWeekDo.setSummary("Test Summary");
        recordWeekDo.setId(1);
        return recordWeekDo;
    }
}

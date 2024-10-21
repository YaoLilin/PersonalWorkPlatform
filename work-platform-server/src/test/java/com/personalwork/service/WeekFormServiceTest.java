package com.personalwork.service;

import com.personalwork.base.TestSetUp;
import com.personalwork.constants.Mark;
import com.personalwork.dao.*;
import com.personalwork.exception.ProblemAddException;
import com.personalwork.modal.dto.WeekFormDto;
import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.entity.ProjectTimeDo;
import com.personalwork.modal.entity.RecordWeekDo;
import com.personalwork.modal.query.WeekFormParam;
import org.junit.jupiter.api.Test;
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

    @InjectMocks
    private WeekFormService weekFormService;


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

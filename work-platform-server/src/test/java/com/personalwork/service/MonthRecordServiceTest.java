package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.RecordMonthMapper;
import com.personalwork.enu.Mark;
import com.personalwork.enu.ProjectState;
import com.personalwork.modal.dto.MonthProjectCountDto;
import com.personalwork.modal.dto.MonthRecordDto;
import com.personalwork.modal.entity.MonthProjectCountDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.RecordMonthDo;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.query.MonthFormParam;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ContextConfiguration(classes = {MonthRecordService.class})
@ExtendWith(SpringExtension.class)
class MonthRecordServiceTest {
    @MockBean
    private MonthProjectCountMapper monthProjectCountMapper;

    @Autowired
    private MonthRecordService monthRecordService;

    @MockBean
    private ProjectMapper projectMapper;

    @MockBean
    private ProjectTimeMapper projectTimeMapper;

    @MockBean
    private RecordMonthMapper recordMonthMapper;

    /**
     * Method under test: {@link MonthRecordService#getWorkMonthRecordList()}
     */
    @Test
    void testGetWorkMonthRecordList() {
        when(recordMonthMapper.list()).thenReturn(new ArrayList<>());
        assertTrue(monthRecordService.getWorkMonthRecordList().isEmpty());
        verify(recordMonthMapper).list();
    }

    /**
     * Method under test: {@link MonthRecordService#getWorkMonthRecordList()}
     */
    @Test
    void testGetWorkMonthRecordList2() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(1);
        recordMonthDo.setIsSummarize(1);
        recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setMonth(1);
        recordMonthDo.setSummary("Summary");
        recordMonthDo.setWorkTime(1);
        recordMonthDo.setYear(1);

        ArrayList<RecordMonthDo> recordMonthDoList = new ArrayList<>();
        recordMonthDoList.add(recordMonthDo);
        when(recordMonthMapper.list()).thenReturn(recordMonthDoList);
        ArrayList<MonthProjectCountDo> monthProjectCountDoList = new ArrayList<>();
        when(monthProjectCountMapper.list((Integer) any())).thenReturn(monthProjectCountDoList);
        List<MonthRecordDto> actualWorkMonthList = monthRecordService.getWorkMonthRecordList();
        assertEquals(1, actualWorkMonthList.size());
        MonthRecordDto getResult = actualWorkMonthList.get(0);
        assertEquals(monthProjectCountDoList, getResult.getProjectCountList());
        assertSame(recordMonthDo, getResult.getRecordMonthDo());
        verify(recordMonthMapper).list();
        verify(monthProjectCountMapper).list((Integer) any());
    }

    /**
     * Method under test: {@link MonthRecordService#getWorkMonthRecordList()}
     */
    @Test
    void testGetWorkMonthRecordList3() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(1);
        recordMonthDo.setIsSummarize(1);
                recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setMonth(1);
        recordMonthDo.setSummary("Summary");
        recordMonthDo.setWorkTime(1);
        recordMonthDo.setYear(1);

        RecordMonthDo recordMonthDo1 = new RecordMonthDo();
        recordMonthDo1.setId(2);
        recordMonthDo1.setIsSummarize(0);
        recordMonthDo1.setMark(Mark.UNQUALIFIED);
        recordMonthDo1.setMonth(0);
        recordMonthDo1.setSummary("com.personalwork.modal.entity.RecordMonthDo");
        recordMonthDo1.setWorkTime(0);
        recordMonthDo1.setYear(0);

        ArrayList<RecordMonthDo> recordMonthDoList = new ArrayList<>();
        recordMonthDoList.add(recordMonthDo1);
        recordMonthDoList.add(recordMonthDo);
        when(recordMonthMapper.list()).thenReturn(recordMonthDoList);
        ArrayList<MonthProjectCountDo> monthProjectCountDoList = new ArrayList<>();
        when(monthProjectCountMapper.list((Integer) any())).thenReturn(monthProjectCountDoList);
        List<MonthRecordDto> actualWorkMonthList = monthRecordService.getWorkMonthRecordList();
        assertEquals(2, actualWorkMonthList.size());
        MonthRecordDto getResult = actualWorkMonthList.get(0);
        assertSame(recordMonthDo1, getResult.getRecordMonthDo());
        MonthRecordDto getResult1 = actualWorkMonthList.get(1);
        assertSame(recordMonthDo, getResult1.getRecordMonthDo());
        assertEquals(monthProjectCountDoList, getResult.getProjectCountList());
        assertEquals(monthProjectCountDoList, getResult1.getProjectCountList());
        verify(recordMonthMapper).list();
        verify(monthProjectCountMapper, atLeast(1)).list((Integer) any());
    }

    /**
     * Method under test: {@link MonthRecordService#getWorkMonthRecordList()}
     */
    @Test
    void testGetWorkMonthRecordList4() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(1);
        recordMonthDo.setIsSummarize(1);
                recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setMonth(1);
        recordMonthDo.setSummary("Summary");
        recordMonthDo.setWorkTime(1);
        recordMonthDo.setYear(1);

        ArrayList<RecordMonthDo> recordMonthDoList = new ArrayList<>();
        recordMonthDoList.add(recordMonthDo);
        when(recordMonthMapper.list()).thenReturn(recordMonthDoList);

        MonthProjectCountDo monthProjectCountDo = new MonthProjectCountDo();
        monthProjectCountDo.setId(1);
        monthProjectCountDo.setMinute(1);
        monthProjectCountDo.setMonthId(1);
        monthProjectCountDo.setProjectId(1);

        ArrayList<MonthProjectCountDo> monthProjectCountDoList = new ArrayList<>();
        monthProjectCountDoList.add(monthProjectCountDo);
        when(monthProjectCountMapper.list((Integer) any())).thenReturn(monthProjectCountDoList);

        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("Name");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setCloseDate("2020-03-01");
        projectDo.setEndDate("2020-03-01");
        projectDo.setId(1);
        projectDo.setImportant(1);
        projectDo.setIsStartDateOnly(1);
        projectDo.setName("Name");
        projectDo.setProgress(10.0d);
        projectDo.setStartDate("2020-03-01");
        projectDo.setState(ProjectState.STARTED);
        projectDo.setType(typeDo);
        when(projectMapper.getProject(anyInt())).thenReturn(projectDo);
        List<MonthRecordDto> actualWorkMonthList = monthRecordService.getWorkMonthRecordList();
        assertEquals(1, actualWorkMonthList.size());
        MonthRecordDto getResult = actualWorkMonthList.get(0);
        List<MonthProjectCountDto> projectCountList = getResult.getProjectCountList();
        assertEquals(1, projectCountList.size());
        assertSame(recordMonthDo, getResult.getRecordMonthDo());
        MonthProjectCountDto getResult1 = projectCountList.get(0);
        assertEquals(1, getResult1.getMinute().intValue());
        assertEquals(1, getResult1.getProjectId().intValue());
        assertEquals("Name", getResult1.getProjectName());
        assertEquals(1, getResult1.getId().intValue());
        assertEquals(1, getResult1.getMonthId().intValue());
        verify(recordMonthMapper).list();
        verify(monthProjectCountMapper).list((Integer) any());
        verify(projectMapper).getProject(anyInt());
    }

    /**
     * Method under test: {@link MonthRecordService#getWorkMonthRecordList()}
     */
    @Test
    void testGetWorkMonthRecordList5() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(1);
        recordMonthDo.setIsSummarize(1);
        recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setMonth(1);
        recordMonthDo.setSummary("Summary");
        recordMonthDo.setWorkTime(1);
        recordMonthDo.setYear(1);

        ArrayList<RecordMonthDo> recordMonthDoList = new ArrayList<>();
        recordMonthDoList.add(recordMonthDo);
        when(recordMonthMapper.list()).thenReturn(recordMonthDoList);

        MonthProjectCountDo monthProjectCountDo = new MonthProjectCountDo();
        monthProjectCountDo.setId(1);
        monthProjectCountDo.setMinute(1);
        monthProjectCountDo.setMonthId(1);
        monthProjectCountDo.setProjectId(1);

        MonthProjectCountDo monthProjectCountDo1 = new MonthProjectCountDo();
        monthProjectCountDo1.setId(2);
        monthProjectCountDo1.setMinute(0);
        monthProjectCountDo1.setMonthId(2);
        monthProjectCountDo1.setProjectId(2);

        ArrayList<MonthProjectCountDo> monthProjectCountDoList = new ArrayList<>();
        monthProjectCountDoList.add(monthProjectCountDo1);
        monthProjectCountDoList.add(monthProjectCountDo);
        when(monthProjectCountMapper.list((Integer) any())).thenReturn(monthProjectCountDoList);

        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("Name");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setCloseDate("2020-03-01");
        projectDo.setEndDate("2020-03-01");
        projectDo.setId(1);
        projectDo.setImportant(1);
        projectDo.setIsStartDateOnly(1);
        projectDo.setName("Name");
        projectDo.setProgress(10.0d);
        projectDo.setStartDate("2020-03-01");
        projectDo.setState(ProjectState.STARTED);
        projectDo.setType(typeDo);
        when(projectMapper.getProject(anyInt())).thenReturn(projectDo);
        List<MonthRecordDto> actualWorkMonthList = monthRecordService.getWorkMonthRecordList();
        assertEquals(1, actualWorkMonthList.size());
        MonthRecordDto getResult = actualWorkMonthList.get(0);
        List<MonthProjectCountDto> projectCountList = getResult.getProjectCountList();
        assertEquals(2, projectCountList.size());
        assertSame(recordMonthDo, getResult.getRecordMonthDo());
        MonthProjectCountDto getResult1 = projectCountList.get(1);
        assertEquals(1, getResult1.getMonthId().intValue());
        assertEquals(1, getResult1.getMinute().intValue());
        assertEquals(1, getResult1.getId().intValue());
        assertEquals("Name", getResult1.getProjectName());
        MonthProjectCountDto getResult2 = projectCountList.get(0);
        assertEquals(0, getResult2.getMinute().intValue());
        assertEquals(2, getResult2.getMonthId().intValue());
        assertEquals("Name", getResult2.getProjectName());
        assertEquals(1, getResult1.getProjectId().intValue());
        assertEquals(2, getResult2.getId().intValue());
        assertEquals(2, getResult2.getProjectId().intValue());
        verify(recordMonthMapper).list();
        verify(monthProjectCountMapper).list((Integer) any());
        verify(projectMapper, atLeast(1)).getProject(anyInt());
    }

    /**
     * Method under test: {@link MonthRecordService#saveForm(Integer, MonthFormParam)}
     */
    @Test
    void testSaveForm() {
        when(recordMonthMapper.update((RecordMonthDo) any())).thenReturn(true);

        MonthFormParam monthFormParam = new MonthFormParam();
        monthFormParam.setMark(Mark.UNQUALIFIED);
        monthFormParam.setSummary("Summary");
        assertTrue(monthRecordService.saveForm(1, monthFormParam));
        verify(recordMonthMapper).update((RecordMonthDo) any());
    }

    /**
     * Method under test: {@link MonthRecordService#saveForm(Integer, MonthFormParam)}
     */
    @Test
    void testSaveForm2() {
        when(recordMonthMapper.update((RecordMonthDo) any())).thenReturn(false);

        MonthFormParam monthFormParam = new MonthFormParam();
        monthFormParam.setMark(Mark.UNQUALIFIED);
        monthFormParam.setSummary("Summary");
        assertFalse(monthRecordService.saveForm(1, monthFormParam));
        verify(recordMonthMapper).update((RecordMonthDo) any());
    }

    /**
     * Method under test: {@link MonthRecordService#getMonth(Integer)}
     */
    @Test
    void testGetMonth() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(1);
        recordMonthDo.setIsSummarize(1);
        recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setMonth(1);
        recordMonthDo.setSummary("Summary");
        recordMonthDo.setWorkTime(1);
        recordMonthDo.setYear(1);
        when(recordMonthMapper.getById(anyInt())).thenReturn(recordMonthDo);
        ArrayList<MonthProjectCountDo> monthProjectCountDoList = new ArrayList<>();
        when(monthProjectCountMapper.list((Integer) any())).thenReturn(monthProjectCountDoList);
        MonthRecordDto actualMonth = monthRecordService.getMonth(1);
        assertEquals(monthProjectCountDoList, actualMonth.getProjectCountList());
        assertSame(recordMonthDo, actualMonth.getRecordMonthDo());
        verify(recordMonthMapper).getById(anyInt());
        verify(monthProjectCountMapper).list((Integer) any());
    }

    /**
     * Method under test: {@link MonthRecordService#getMonth(Integer)}
     */
    @Test
    void testGetMonth2() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(1);
        recordMonthDo.setIsSummarize(1);
                recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setMonth(1);
        recordMonthDo.setSummary("Summary");
        recordMonthDo.setWorkTime(1);
        recordMonthDo.setYear(1);
        when(recordMonthMapper.getById(anyInt())).thenReturn(recordMonthDo);

        MonthProjectCountDo monthProjectCountDo = new MonthProjectCountDo();
        monthProjectCountDo.setId(1);
        monthProjectCountDo.setMinute(1);
        monthProjectCountDo.setMonthId(1);
        monthProjectCountDo.setProjectId(1);

        ArrayList<MonthProjectCountDo> monthProjectCountDoList = new ArrayList<>();
        monthProjectCountDoList.add(monthProjectCountDo);
        when(monthProjectCountMapper.list((Integer) any())).thenReturn(monthProjectCountDoList);

        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("Name");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setCloseDate("2020-03-01");
        projectDo.setEndDate("2020-03-01");
        projectDo.setId(1);
        projectDo.setImportant(1);
        projectDo.setIsStartDateOnly(1);
        projectDo.setName("Name");
        projectDo.setProgress(10.0d);
        projectDo.setStartDate("2020-03-01");
        projectDo.setState(ProjectState.STARTED);
        projectDo.setType(typeDo);
        when(projectMapper.getProject(anyInt())).thenReturn(projectDo);
        MonthRecordDto actualMonth = monthRecordService.getMonth(1);
        List<MonthProjectCountDto> projectCountList = actualMonth.getProjectCountList();
        assertEquals(1, projectCountList.size());
        assertSame(recordMonthDo, actualMonth.getRecordMonthDo());
        MonthProjectCountDto getResult = projectCountList.get(0);
        assertEquals(1, getResult.getMinute().intValue());
        assertEquals(1, getResult.getProjectId().intValue());
        assertEquals("Name", getResult.getProjectName());
        assertEquals(1, getResult.getId().intValue());
        assertEquals(1, getResult.getMonthId().intValue());
        verify(recordMonthMapper).getById(anyInt());
        verify(monthProjectCountMapper).list((Integer) any());
        verify(projectMapper).getProject(anyInt());
    }

    /**
     * Method under test: {@link MonthRecordService#getMonth(Integer)}
     */
    @Test
    void testGetMonth3() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(1);
        recordMonthDo.setIsSummarize(1);
                recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setMonth(1);
        recordMonthDo.setSummary("Summary");
        recordMonthDo.setWorkTime(1);
        recordMonthDo.setYear(1);
        when(recordMonthMapper.getById(anyInt())).thenReturn(recordMonthDo);

        MonthProjectCountDo monthProjectCountDo = new MonthProjectCountDo();
        monthProjectCountDo.setId(1);
        monthProjectCountDo.setMinute(1);
        monthProjectCountDo.setMonthId(1);
        monthProjectCountDo.setProjectId(1);

        MonthProjectCountDo monthProjectCountDo1 = new MonthProjectCountDo();
        monthProjectCountDo1.setId(2);
        monthProjectCountDo1.setMinute(0);
        monthProjectCountDo1.setMonthId(2);
        monthProjectCountDo1.setProjectId(2);

        ArrayList<MonthProjectCountDo> monthProjectCountDoList = new ArrayList<>();
        monthProjectCountDoList.add(monthProjectCountDo1);
        monthProjectCountDoList.add(monthProjectCountDo);
        when(monthProjectCountMapper.list((Integer) any())).thenReturn(monthProjectCountDoList);

        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        typeDo.setName("Name");
        typeDo.setParentId(1);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setCloseDate("2020-03-01");
        projectDo.setEndDate("2020-03-01");
        projectDo.setId(1);
        projectDo.setImportant(1);
        projectDo.setIsStartDateOnly(1);
        projectDo.setName("Name");
        projectDo.setProgress(10.0d);
        projectDo.setStartDate("2020-03-01");
        projectDo.setState(ProjectState.STARTED);
        projectDo.setType(typeDo);
        when(projectMapper.getProject(anyInt())).thenReturn(projectDo);
        MonthRecordDto actualMonth = monthRecordService.getMonth(1);
        List<MonthProjectCountDto> projectCountList = actualMonth.getProjectCountList();
        assertEquals(2, projectCountList.size());
        assertSame(recordMonthDo, actualMonth.getRecordMonthDo());
        MonthProjectCountDto getResult = projectCountList.get(1);
        assertEquals(1, getResult.getMonthId().intValue());
        assertEquals(1, getResult.getMinute().intValue());
        assertEquals(1, getResult.getId().intValue());
        assertEquals("Name", getResult.getProjectName());
        MonthProjectCountDto getResult1 = projectCountList.get(0);
        assertEquals(0, getResult1.getMinute().intValue());
        assertEquals(2, getResult1.getMonthId().intValue());
        assertEquals("Name", getResult1.getProjectName());
        assertEquals(1, getResult.getProjectId().intValue());
        assertEquals(2, getResult1.getId().intValue());
        assertEquals(2, getResult1.getProjectId().intValue());
        verify(recordMonthMapper).getById(anyInt());
        verify(monthProjectCountMapper).list((Integer) any());
        verify(projectMapper, atLeast(1)).getProject(anyInt());
    }
}


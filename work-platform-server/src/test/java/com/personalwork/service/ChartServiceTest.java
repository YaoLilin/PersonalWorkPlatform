package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.TypeMapper;
import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.exception.ChartCalculateException;
import com.personalwork.modal.entity.MonthProjectCountDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import com.personalwork.modal.vo.PieCountVo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ChartServiceTest {
    @InjectMocks
    private ChartService chartService;

    @Mock
    private MonthProjectCountMapper monthProjectCountMapper;
    @Mock
    private ProjectMapper projectMapper;
    @Mock
    private TypeMapper typeMapper;
    @Mock
    private WeekProjectTimeCountMapper weekProjectTimeCountMapper;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testTypeTimeCountOfMonth() {
        MonthProjectCountDo monthProjectCountDo1 = getMonthProjectCountDo(1, 60);
        MonthProjectCountDo monthProjectCountDo2 = getMonthProjectCountDo(2, 120);
        when(monthProjectCountMapper.list(any())).thenReturn(Stream.of(monthProjectCountDo1, monthProjectCountDo2).toList());
        ProjectDo projectDo1 = getProjectDo(1,1,"type1");
        ProjectDo projectDo2 = getProjectDo(2,2,"type2");
        when(projectMapper.getProject(1)).thenReturn(projectDo1);
        when(projectMapper.getProject(2)).thenReturn(projectDo2);
        List<PieCountVo> pieCountVos = chartService.typeTimeCountOfMonth(1, 1);
        assertEquals(2, pieCountVos.size());
        assertEquals(60, pieCountVos.get(0).getCount());
        assertEquals(120, pieCountVos.get(1).getCount());
        assertEquals("type1", pieCountVos.get(0).getName());
        assertEquals("type2", pieCountVos.get(1).getName());
        assertEquals(33, pieCountVos.get(0).getPercent());
        assertEquals(67, pieCountVos.get(1).getPercent());
    }

    @Test
    public void testTypeTimeCountOfWeek() {
        WeekProjectTimeCountDo weekProjectTimeCountDo1 = getWeekProjectTimeCountDo(1, 60);
        WeekProjectTimeCountDo weekProjectTimeCountDo2 = getWeekProjectTimeCountDo(2, 120);
        when(weekProjectTimeCountMapper.listByWeekId(any())).thenReturn(Stream.of(weekProjectTimeCountDo1, weekProjectTimeCountDo2).toList());
        ProjectDo projectDo1 = getProjectDo(1,1,"type1");
        ProjectDo projectDo2 = getProjectDo(2,2,"type2");
        when(projectMapper.getProject(1)).thenReturn(projectDo1);
        when(projectMapper.getProject(2)).thenReturn(projectDo2);
        List<PieCountVo> pieCountVos = chartService.typeTimeCountOfWeek(1, 1);
        assertEquals(2, pieCountVos.size());
        assertEquals(60, pieCountVos.get(0).getCount());
        assertEquals(120, pieCountVos.get(1).getCount());
        assertEquals("type1", pieCountVos.get(0).getName());
        assertEquals("type2", pieCountVos.get(1).getName());
        assertEquals(33, pieCountVos.get(0).getPercent());
        assertEquals(67, pieCountVos.get(1).getPercent());
    }

    @Test
    public void testTypeTimeCountOfMonth_withNullProjectTime() {
        MonthProjectCountDo monthProjectCountDo1 = getMonthProjectCountDo(1, null);
        when(monthProjectCountMapper.list(any())).thenReturn(Stream.of(monthProjectCountDo1).toList());
        ChartCalculateException.TypeChartCalculateException exception = assertThrows(ChartCalculateException.TypeChartCalculateException.class,
                () -> chartService.typeTimeCountOfMonth(1, 1));
        assertTrue(exception.getMessage().contains("项目时间不允许为空或0"));
    }

    @Test
    public void testTypeTimeCountOfMonth_withNullProjectId() {
        MonthProjectCountDo monthProjectCountDo1 = getMonthProjectCountDo(null, 1);
        when(monthProjectCountMapper.list(any())).thenReturn(Stream.of(monthProjectCountDo1).toList());
        ChartCalculateException.TypeChartCalculateException exception = assertThrows(ChartCalculateException.TypeChartCalculateException.class,
                () -> chartService.typeTimeCountOfMonth(1, 1));
        assertTrue(exception.getMessage().contains("项目id不允许为空"));
    }

    private  MonthProjectCountDo getMonthProjectCountDo(Integer projectId, Integer minute) {
        MonthProjectCountDo monthProjectCountDo1 = new MonthProjectCountDo();
        monthProjectCountDo1.setProjectId(projectId);
        monthProjectCountDo1.setMinute(minute);
        return monthProjectCountDo1;
    }

    private WeekProjectTimeCountDo getWeekProjectTimeCountDo(Integer projectId, Integer minute) {
        WeekProjectTimeCountDo weekProjectTimeCountDo = new WeekProjectTimeCountDo();
        weekProjectTimeCountDo.setProject(projectId);
        weekProjectTimeCountDo.setMinutes(minute);
        return weekProjectTimeCountDo;
    }

    private  ProjectDo getProjectDo(int projectId,int typeId,String  typeName) {
        ProjectDo projectDo = new ProjectDo();
        projectDo.setId(projectId);
        TypeDo typeDo = new TypeDo();
        typeDo.setId(typeId);
        typeDo.setName(typeName);
        projectDo.setType(typeDo);
        return projectDo;
    }


}

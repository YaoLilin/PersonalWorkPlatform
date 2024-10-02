package com.personalwork.service;

import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.RecordWeekDo;
import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import com.personalwork.modal.vo.WeekProjectTimeVo;
import com.personalwork.modal.vo.WeeksVo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;

@ExtendWith(MockitoExtension.class)
public class WeekListServiceTest {

    @InjectMocks
    private WeekListService weekListService;

    @Mock
    private RecordWeekMapper recordWeekMapper;
    @Mock
    private WeekProjectTimeCountMapper projectTimeCountMapper;
    @Mock
    private ProjectMapper projectMapper;

    @BeforeEach
    public void setUp() {
        // Setup mock data
        RecordWeekDo recordWeekDo = new RecordWeekDo();
        recordWeekDo.setId(1);
        recordWeekDo.setTime(400); // 10 hours

        List<RecordWeekDo> recordWeekDoList = new ArrayList<>();
        recordWeekDoList.add(recordWeekDo);

        WeekProjectTimeCountDo weekProjectTimeCountDo = new WeekProjectTimeCountDo();
        weekProjectTimeCountDo.setMinutes(300); // 5 hours
        weekProjectTimeCountDo.setProject(1);
        WeekProjectTimeCountDo weekProjectTimeCountDo2 = new WeekProjectTimeCountDo();
        weekProjectTimeCountDo2.setMinutes(100); // 5 hours
        weekProjectTimeCountDo2.setProject(2);

        List<WeekProjectTimeCountDo> weekProjectTimeCountDoList = new ArrayList<>();
        weekProjectTimeCountDoList.add(weekProjectTimeCountDo);
        weekProjectTimeCountDoList.add(weekProjectTimeCountDo2);

        ProjectDo projectDo = new ProjectDo();
        projectDo.setName("Test Project1");
        projectDo.setId(1);
        ProjectDo projectDo2 = new ProjectDo();
        projectDo2.setName("Test Project2");
        projectDo2.setId(2);

        // Setup mock behavior
        Mockito.when(recordWeekMapper.getWorkWeekList(anyInt())).thenReturn(recordWeekDoList);
        Mockito.when(projectTimeCountMapper.listByWeekId(Mockito.anyInt())).thenReturn(weekProjectTimeCountDoList);
        Mockito.when(projectMapper.getProject(Mockito.eq(1))).thenReturn(projectDo);
        Mockito.when(projectMapper.getProject(Mockito.eq(2))).thenReturn(projectDo2);
    }

    @Test
    public void testGetCardList() {
        List<WeeksVo> result = weekListService.getCardList();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());

        WeeksVo weeksVo = result.get(0);
        assertEquals(1, weeksVo.getId());
        assertEquals(6.67, weeksVo.getHours(), 0);
        assertFalse(weeksVo.getProjectTime().isEmpty());
        assertEquals(2, weeksVo.getProjectTime().size());

        WeekProjectTimeVo projectTimeVo = weeksVo.getProjectTime().get(0);
        assertEquals("Test Project1", projectTimeVo.getProjectName());
        assertEquals(300, projectTimeVo.getMinutes());
        assertEquals(5, projectTimeVo.getHours(), 0);
        assertEquals("75", projectTimeVo.getPercent());
    }
}

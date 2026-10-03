package com.personalwork.service;

import com.personalwork.base.TestSetUp;
import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.domain.dto.TaskTimeDto;
import com.personalwork.domain.entity.RecordWeekDo;
import com.personalwork.domain.vo.WeekProjectTimeVo;
import com.personalwork.domain.vo.WeeksVo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.any;

class WeekListServiceTest extends TestSetUp {

    @InjectMocks
    private WeekListService weekListService;

    @Mock
    private RecordWeekMapper recordWeekMapper;
    @Mock
    private TaskTimeCountService taskTimeCountService;

    @BeforeEach
    void setUp() {
        // Setup mock data
        RecordWeekDo recordWeekDo = new RecordWeekDo();
        recordWeekDo.setId(1);
        recordWeekDo.setDate("2026-09-28");
        recordWeekDo.setTime(400); // 10 hours

        List<RecordWeekDo> recordWeekDoList = new ArrayList<>();
        recordWeekDoList.add(recordWeekDo);

        // Setup mock behavior
        Mockito.when(recordWeekMapper.getWorkWeekList(anyInt())).thenReturn(recordWeekDoList);
        Mockito.when(taskTimeCountService.listEvents()).thenReturn(List.of());
        Mockito.when(taskTimeCountService.count(any(), Mockito.eq(LocalDate.parse("2026-09-28")),
                Mockito.eq(LocalDate.parse("2026-10-05")))).thenReturn(List.of(
                new TaskTimeDto(1, "Test Project1", 300, false),
                new TaskTimeDto(2, "清单 A", 100, true)));
    }

    @Test
    void testGetCardList() {
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
        assertTrue(weeksVo.getProjectTime().get(1).getChecklist());
    }
}

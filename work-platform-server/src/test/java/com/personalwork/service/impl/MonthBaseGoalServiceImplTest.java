package com.personalwork.service.impl;

import com.personalwork.base.TestSetUp;
import com.personalwork.dao.MonthGoalMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.modal.dto.MonthGoalDto;
import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.query.GoalQueryParam;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class MonthBaseGoalServiceImplTest extends TestSetUp {

    @Mock
    private MonthGoalMapper goalMapper;
    @Mock
    private ProjectMapper projectMapper;
    @InjectMocks
    private MonthGoalServiceImpl monthGoalService;


    @Test
    void testGetGoalsWithNonEmptyResult() {
        // Arrange
        GoalQueryParam param = new GoalQueryParam();
        GoalDo goalDo = new GoalDo();
        goalDo.setProjectId(1);
        List<GoalDo> goalDos = Arrays.asList(goalDo);
        MonthGoalDto monthGoalDto = new MonthGoalDto();
        ProjectDo projectDo = new ProjectDo();
        projectDo.setName("Test Project");

        when(goalMapper.list(any())).thenReturn((List) goalDos);
        when(projectMapper.getProject(goalDo.getProjectId())).thenReturn(projectDo);

        // Act
        List<MonthGoalDto> result = monthGoalService.getGoals(param);

        // Assert
        assertEquals(1, result.size());
        assertEquals(projectDo, result.get(0).getProject());
        verify(goalMapper).list(param);
        verify(projectMapper).getProject(goalDo.getProjectId());
    }

    @Test
    void testGetGoalsWithEmptyResult() {
        // Arrange
        GoalQueryParam param = new GoalQueryParam();
        when(goalMapper.list(param)).thenReturn(Collections.emptyList());

        // Act
        List<MonthGoalDto> result = monthGoalService.getGoals(param);

        // Assert
        assertEquals(0, result.size());
        verify(goalMapper).list(param);
        verifyNoMoreInteractions(projectMapper);
    }
}

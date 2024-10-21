package com.personalwork.service.impl;

import com.personalwork.base.TestSetUp;
import com.personalwork.constants.ProjectState;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.WeekGoalMapper;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.entity.WeekGoalDo;
import com.personalwork.modal.query.GoalQueryParam;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

/**
 * @author 姚礼林
 * @desc 周问题业务类测试
 * @date 2024/6/23
 */
class WeekBaseGoalServiceImplTest extends TestSetUp {

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private WeekGoalMapper weekGoalMapper;

    @InjectMocks
    private WeekGoalServiceImpl weekGoalServiceImpl;

    /**
     * Method under test: {@link WeekGoalServiceImpl#getGoals(GoalQueryParam)}
     */
    @Test
    void testGetGoals() {
        when( weekGoalMapper.list(any())).thenReturn(new ArrayList<>());

        GoalQueryParam goalQueryParam = new GoalQueryParam();
        goalQueryParam.setYear(1);
        assertTrue(weekGoalServiceImpl.getGoals(goalQueryParam).isEmpty());
        verify(weekGoalMapper).list(any());
    }

    /**
     * Method under test: {@link WeekGoalServiceImpl#getGoals(GoalQueryParam)}
     */
    @Test
    void testGetGoals2() {
        WeekGoalDo goalDo = new WeekGoalDo();
        goalDo.setContent("Not all who wander are lost");
        goalDo.setId(1);
        goalDo.setIsDone(1);
        goalDo.setProjectId(1);
        goalDo.setYear(1);

        ArrayList<WeekGoalDo> goalDoList = new ArrayList<>();
        goalDoList.add(goalDo);
        when(weekGoalMapper.list(any())).thenReturn(goalDoList);

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

        GoalQueryParam goalQueryParam = new GoalQueryParam();
        goalQueryParam.setYear(1);
        assertEquals(1, weekGoalServiceImpl.getGoals(goalQueryParam).size());
        verify(weekGoalMapper).list((GoalQueryParam) any());
        verify(projectMapper).getProject(anyInt());
    }

    /**
     * Method under test: {@link WeekGoalServiceImpl#getGoals(GoalQueryParam)}
     */
    @Test
    void testGetGoals3() {
        WeekGoalDo goalDo = new WeekGoalDo();
        goalDo.setContent("Not all who wander are lost");
        goalDo.setId(1);
        goalDo.setIsDone(1);
        goalDo.setProjectId(1);
        goalDo.setYear(1);

        WeekGoalDo goalDo1 = new WeekGoalDo();
        goalDo1.setContent("Content");
        goalDo1.setId(2);
        goalDo1.setIsDone(0);
        goalDo1.setProjectId(2);
        goalDo1.setYear(0);

        ArrayList<WeekGoalDo> goalDoList = new ArrayList<>();
        goalDoList.add(goalDo1);
        goalDoList.add(goalDo);
        when(weekGoalMapper.list( any())).thenReturn(goalDoList);

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

        GoalQueryParam goalQueryParam = new GoalQueryParam();
        goalQueryParam.setYear(1);
        assertEquals(2, weekGoalServiceImpl.getGoals(goalQueryParam).size());
        verify(weekGoalMapper).list((GoalQueryParam) any());
        verify(projectMapper, atLeast(1)).getProject(anyInt());
    }
}

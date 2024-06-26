package com.personalwork.service.impl;

import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.WeekGoalMapper;
import com.personalwork.enu.ProjectState;
import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.query.GoalQueryParam;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/6/23
 */
@ContextConfiguration(classes = {WeekGoalServiceImpl.class})
@ExtendWith(SpringExtension.class)
class WeekGoalServiceImplTest {

    @MockBean
    private ProjectMapper projectMapper;

    @MockBean
    private WeekGoalMapper weekGoalMapper;

    @Autowired
    private WeekGoalServiceImpl weekGoalServiceImpl;

    @Test
    void getGoals() {
    }

    /**
     * Method under test: {@link WeekGoalServiceImpl#getGoals(GoalQueryParam)}
     */
    @Test
    void testGetGoals() {
        when((List<GoalDo>) weekGoalMapper.list((GoalQueryParam) any())).thenReturn(new ArrayList<>());

        GoalQueryParam goalQueryParam = new GoalQueryParam();
        goalQueryParam.setYear(1);
        assertTrue(weekGoalServiceImpl.getGoals(goalQueryParam).isEmpty());
        verify(weekGoalMapper).list((GoalQueryParam) any());
    }

    /**
     * Method under test: {@link WeekGoalServiceImpl#getGoals(GoalQueryParam)}
     */
    @Test
    void testGetGoals2() {
        GoalDo goalDo = new GoalDo();
        goalDo.setContent("Not all who wander are lost");
        goalDo.setId(1);
        goalDo.setIsDone(1);
        goalDo.setProjectId(1);
        goalDo.setYear(1);

        ArrayList<GoalDo> goalDoList = new ArrayList<>();
        goalDoList.add(goalDo);
        when((List<GoalDo>) weekGoalMapper.list((GoalQueryParam) any())).thenReturn(goalDoList);

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
        GoalDo goalDo = new GoalDo();
        goalDo.setContent("Not all who wander are lost");
        goalDo.setId(1);
        goalDo.setIsDone(1);
        goalDo.setProjectId(1);
        goalDo.setYear(1);

        GoalDo goalDo1 = new GoalDo();
        goalDo1.setContent("Content");
        goalDo1.setId(2);
        goalDo1.setIsDone(0);
        goalDo1.setProjectId(2);
        goalDo1.setYear(0);

        ArrayList<GoalDo> goalDoList = new ArrayList<>();
        goalDoList.add(goalDo1);
        goalDoList.add(goalDo);
        when((List<GoalDo>) weekGoalMapper.list((GoalQueryParam) any())).thenReturn(goalDoList);

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
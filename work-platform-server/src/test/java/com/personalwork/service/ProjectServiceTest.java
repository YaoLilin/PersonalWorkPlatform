package com.personalwork.service;

import com.personalwork.base.TestSetUp;
import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.modal.dto.ProjectDto;
import com.personalwork.modal.entity.*;
import com.personalwork.modal.query.ProjectParam;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.BeanUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest extends TestSetUp {

    @Mock
    private ProjectMapper projectMapper;
    @Mock
    private MonthProjectCountMapper monthProjectCountMapper;
    @Mock
    private ProjectTimeMapper projectTimeMapper;
    @Mock
    private WeekProjectTimeCountMapper weekProjectTimeCountMapper;

    @InjectMocks
    private ProjectService projectService;

    private ProjectParam projectParam;
    private ProjectDo projectDo;
    private ProjectDto projectDto;
    private List<ProjectDo> projectDoList;
    private List<MonthProjectCountDo> monthProjectCountDoList;
    private List<ProjectTimeDo> projectTimeDoList;
    private List<WeekProjectTimeCountDo> weekProjectTimeCountDoList;

    @BeforeEach
    void setUp() {
        projectParam = new ProjectParam();
        projectParam.setId(1);
        projectParam.setName("Test Project");

        TypeDo typeDo = new TypeDo();
        typeDo.setName("type1");
        typeDo.setId(1);

        projectDo = new ProjectDo();
        projectDo.setId(1);
        projectDo.setName("Test Project");
        projectDo.setType(typeDo);

        projectDto = new ProjectDto();
        BeanUtils.copyProperties(projectDo, projectDto);
        projectDto.setTypeName("type1");
        projectDto.setTypeId(1);

        projectDoList = Collections.singletonList(projectDo);
        monthProjectCountDoList = Collections.emptyList();
        projectTimeDoList = Collections.emptyList();
        weekProjectTimeCountDoList = Collections.emptyList();
    }

    @Test
    void testGetAll() {
        when(projectMapper.listByUser(anyInt())).thenReturn(projectDoList);
        List<ProjectDto> result = projectService.getAll();
        assertNotNull(result);
        assertEquals(1, result.size());
        assertProjectDtoEquals(projectDto, result.get(0));
    }

    @Test
    void testGetProject() {
        when(projectMapper.getProject(1)).thenReturn(projectDo);
        ProjectDto result = projectService.getProject(1);
        assertNotNull(result);
        assertProjectDtoEquals(projectDto, result);
    }

    @Test
    void testAddProject() {
        when(projectMapper.addProject(any(ProjectDo.class))).thenReturn(true);
        boolean result = projectService.addProject(projectParam);
        assertTrue(result);
        verify(projectMapper).addProject(any(ProjectDo.class));
    }

    @Test
    void testDeleteProject() {
        when(projectMapper.deleteProject(eq(1))).thenReturn(true);
        when(projectTimeMapper.deleteByProjectId(eq(1))).thenReturn(true);
        ;
        when(weekProjectTimeCountMapper.deleteByProjectId(eq(1))).thenReturn(true);
        when(monthProjectCountMapper.deleteByProjectId(eq(1))).thenReturn(true);

        boolean result = projectService.deleteProject(Arrays.asList(1));
        assertTrue(result);
        verify(projectMapper).deleteProject(1);
        verify(projectTimeMapper).deleteByProjectId(1);
        verify(weekProjectTimeCountMapper).deleteByProjectId(1);
        verify(monthProjectCountMapper).deleteByProjectId(1);
    }

    @Test
    void testDeleteProjectList() {
        when(projectMapper.deleteProject(1)).thenReturn(true);
        boolean result = projectService.deleteProjectList(1);
        assertTrue(result);
        verify(projectMapper).deleteProject(1);
    }

    @Test
    void testUpdateProject() {
        when(projectMapper.updateProject(any(ProjectDo.class))).thenReturn(true);
        boolean result = projectService.updateProject(projectParam);
        assertTrue(result);
        verify(projectMapper).updateProject(any(ProjectDo.class));
    }

    @Test
    void testExistRecordFalse() {
        when(monthProjectCountMapper.listByProjectId(1)).thenReturn(monthProjectCountDoList);
        when(projectTimeMapper.getProjectTimeByProjectId(1)).thenReturn(projectTimeDoList);
        when(weekProjectTimeCountMapper.listByProjectId(1)).thenReturn(weekProjectTimeCountDoList);
        boolean result = projectService.existRecord(1);
        assertFalse(result);
    }

    @Test
    void testExistRecordTrue() {
        when(monthProjectCountMapper.listByProjectId(1)).thenReturn(Collections.singletonList(new MonthProjectCountDo()));
        boolean result = projectService.existRecord(1);
        assertTrue(result);
    }

    private void assertProjectDtoEquals(ProjectDto expected, ProjectDto actual) {
        assertEquals(expected.getId(), actual.getId());
        assertEquals(expected.getName(), actual.getName());
        assertEquals(expected.getTypeName(), actual.getTypeName());
        assertEquals(expected.getTypeId(), actual.getTypeId());
    }
}

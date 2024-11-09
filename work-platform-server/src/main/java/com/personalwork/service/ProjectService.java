package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.modal.dto.ProjectDto;
import com.personalwork.modal.entity.*;
import com.personalwork.modal.query.ProjectParam;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * @author 姚礼林
 * @desc 项目业务类
 * @date 2023/3/22
 */
@Service
public class ProjectService {

    private final ProjectMapper projectMapper;
    private final MonthProjectCountMapper monthProjectCountMapper;
    private final ProjectTimeMapper projectTimeMapper;
    private final WeekProjectTimeCountMapper weekProjectTimeCountMapper;

    @Autowired
    public ProjectService(ProjectMapper projectMapper, MonthProjectCountMapper monthProjectCountMapper,
                          ProjectTimeMapper projectTimeMapper, WeekProjectTimeCountMapper weekProjectTimeCountMapper) {
        this.projectMapper = projectMapper;
        this.monthProjectCountMapper = monthProjectCountMapper;
        this.projectTimeMapper = projectTimeMapper;
        this.weekProjectTimeCountMapper = weekProjectTimeCountMapper;
    }


    public List<ProjectDto> getAll() {
        UserDetail loginUser = Objects.requireNonNull(UserUtil.getLoginUser());
        List<ProjectDo> projectsList = projectMapper.listByUser(loginUser.getId());
        List<ProjectDto> data = new ArrayList<>();
        for (ProjectDo project : projectsList) {
            data.add(toProjectDto(project));
        }
        return data;
    }

    public ProjectDto getProject(int id) {
        return toProjectDto(projectMapper.getProject(id));
    }

    private ProjectDto toProjectDto(ProjectDo project) {
        ProjectDto projectDto = new ProjectDto();
        BeanUtils.copyProperties(project,projectDto);
        projectDto.setTypeName(project.getType().getName());
        projectDto.setTypeId(project.getType().getId());
        return projectDto;
    }

    private ProjectDo qrToProject(ProjectParam projectParam) {
        UserDetail loginUser = Objects.requireNonNull(UserUtil.getLoginUser());
        ProjectDo project = new ProjectDo();
        BeanUtils.copyProperties(projectParam,project);
        project.setUserId(loginUser.getId());
        if ("".equals(projectParam.getEndDate())) {
            project.setEndDate(null);
        }
        if ("".equals(projectParam.getCloseDate())) {
            project.setCloseDate(null);
        }
        TypeDo type = new TypeDo();
        type.setId(projectParam.getType());
        project.setType(type);
        return project;
    }

    public boolean addProject(ProjectParam projectParam) {
        return projectMapper.addProject(qrToProject(projectParam));
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteProject(List<Integer> ids) {
        for (Integer id : ids) {
            projectMapper.deleteProject(id);
            // 删除该项目所有的统计记录
            projectTimeMapper.deleteByProjectId(id);
            weekProjectTimeCountMapper.deleteByProjectId(id);
            monthProjectCountMapper.deleteByProjectId(id);
        }
        return true;
    }

    public boolean deleteProjectList(Integer id) {
        return projectMapper.deleteProject(id);
    }

    public boolean updateProject(ProjectParam project) {
        return projectMapper.updateProject(qrToProject(project));
    }

    public boolean existRecord(Integer projectId) {
        List<MonthProjectCountDo> monthCountList = monthProjectCountMapper.listByProjectId(projectId);
        List<ProjectTimeDo> projectTimeList = projectTimeMapper.getProjectTimeByProjectId(projectId);
        List<WeekProjectTimeCountDo> weekProjectCountList = weekProjectTimeCountMapper.listByProjectId(projectId);
        return monthCountList != null && !monthCountList.isEmpty() || projectTimeList != null && !projectTimeList.isEmpty()
                || weekProjectCountList != null && !weekProjectCountList.isEmpty();
    }
}

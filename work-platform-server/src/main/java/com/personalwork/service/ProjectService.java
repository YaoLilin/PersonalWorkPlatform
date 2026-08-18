package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.domain.dto.ProjectDto;
import com.personalwork.domain.entity.*;
import com.personalwork.domain.query.ProjectParam;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * @author 姚礼林
 * @desc 项目业务类
 * @date 2023/3/22
 */
@Service
public class ProjectService {

    private static final String INBOX_NAME = "收集箱";
    private static final String DEFAULT_PROJECT_COLOR = "#1677FF";

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
            if (isInboxProject(project)) {
                continue;
            }
            data.add(toProjectDto(project));
        }
        return data;
    }

    public ProjectDto getProject(int id) {
        return toProjectDto(projectMapper.getProject(id));
    }

    /**
     * 根据项目 ID 查询项目。<br>
     * <p>项目可能已被删除，调用方可通过空结果跳过历史孤儿记录。</p>
     *
     * @param id 项目 ID
     * @return 存在时返回项目数据，否则返回空
     */
    public Optional<ProjectDto> findProject(int id) {
        return Optional.ofNullable(projectMapper.getProject(id)).map(this::toProjectDto);
    }

    private ProjectDto toProjectDto(ProjectDo project) {
        ProjectDto projectDto = new ProjectDto();
        BeanUtils.copyProperties(project,projectDto);
        projectDto.setTypeName(project.getType().getName());
        projectDto.setTypeId(project.getType().getId());
        return projectDto;
    }

    private boolean isInboxProject(ProjectDo project) {
        TypeDo type = project.getType();
        return INBOX_NAME.equals(project.getName()) && type != null && INBOX_NAME.equals(type.getName())
                && type.getParentId() == null;
    }

    private ProjectDo qrToProject(ProjectParam projectParam) {
        UserDetail loginUser = Objects.requireNonNull(UserUtil.getLoginUser());
        ProjectDo project = new ProjectDo();
        BeanUtils.copyProperties(projectParam,project);
        if (project.getColor() == null) {
            project.setColor(DEFAULT_PROJECT_COLOR);
        }
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

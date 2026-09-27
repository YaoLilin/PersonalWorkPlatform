package com.personalwork.service;

import com.personalwork.constants.ProjectState;
import com.personalwork.dao.ChecklistMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.TypeMapper;
import com.personalwork.domain.entity.ChecklistDo;
import com.personalwork.domain.entity.ProjectDo;
import com.personalwork.domain.entity.ProjectTimeDo;
import com.personalwork.domain.entity.TypeDo;
import com.personalwork.domain.query.ScheduleEventParam;
import com.personalwork.domain.vo.ScheduleEventVo;
import com.personalwork.exception.DbOperateException;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * 日程业务服务。<br>
 * <p>负责日程的持久化，以及关联周统计和月统计的重新计算。</p>
 *
 * @author 姚礼林
 */
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private static final String INBOX_NAME = "收集箱";

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("H:mm[:ss]");

    private final ProjectTimeMapper projectTimeMapper;
    private final ProjectMapper projectMapper;
    private final TypeMapper typeMapper;
    private final ChecklistMapper checklistMapper;
    private final WeekFormService weekFormService;

    /**
     * 获取当前用户的全部项目日程。
     *
     * @return 项目日程列表
     */
    public List<ScheduleEventVo> getScheduleEvents() {
        return projectTimeMapper.listScheduleByUser(getLoginUser().getId());
    }

    /**
     * 新增日程，并重新统计受影响周的数据。
     *
     * @param param 日程信息
     * @return 已新增的日程
     */
    @Transactional(rollbackFor = Exception.class)
    public ScheduleEventVo createSchedule(ScheduleEventParam param) {
        LocalDateTimeRange timeRange = validateTimeRange(param);
        ProjectDo project = getUserProject(param.getProjectId());
        ChecklistDo checklist = getChecklist(param.getChecklistId());
        checklist = createChecklistForProject(param, project, checklist);
        updateChecklistName(checklist, param.getScheduleName().trim());
        Set<LocalDate> weekStarts = getWeekStarts(timeRange);
        weekStarts.forEach(weekFormService::ensureWeekForm);
        ProjectTimeDo projectTime = buildProjectTime(param, project, checklist, timeRange);
        projectTime.setWeekId(weekFormService.ensureWeekForm(getWeekStart(timeRange.startDate())).getId());
        projectTimeMapper.insert(projectTime);
        recalculateWeeks(weekStarts);
        return getScheduleEvent(projectTime.getId());
    }

    /**
     * 修改日程，并重新统计修改前后的受影响周数据。
     *
     * @param id 日程编号
     * @param param 日程信息
     * @return 已更新的日程
     */
    @Transactional(rollbackFor = Exception.class)
    public ScheduleEventVo updateSchedule(Integer id, ScheduleEventParam param) {
        ProjectTimeDo originalProjectTime = getSchedule(id);
        LocalDateTimeRange newTimeRange = validateTimeRange(param);
        ChecklistDo checklist = getChecklist(param.getChecklistId());
        updateChecklistName(checklist, param.getScheduleName().trim());
        ProjectDo project = getUserProject(param.getProjectId());
        Set<LocalDate> weekStarts = getWeekStarts(originalProjectTime);
        weekStarts.addAll(getWeekStarts(newTimeRange));
        weekStarts.forEach(weekFormService::ensureWeekForm);
        ProjectTimeDo projectTime = buildProjectTime(param, project, checklist, newTimeRange);
        projectTime.setId(id);
        projectTime.setWeekId(weekFormService.ensureWeekForm(getWeekStart(newTimeRange.startDate())).getId());
        projectTimeMapper.updateSchedule(projectTime);
        recalculateWeeks(weekStarts);
        return getScheduleEvent(id);
    }

    /**
     * 删除日程，并清理不再包含日程和周总结信息的周记录。
     *
     * @param id 日程编号
     * @return 删除结果
     */
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteSchedule(Integer id) {
        ProjectTimeDo projectTime = getSchedule(id);
        Set<LocalDate> weekStarts = getWeekStarts(projectTime);
        boolean deleted = projectTimeMapper.deleteScheduleById(id, getLoginUser().getId());
        recalculateWeeks(weekStarts);
        weekStarts.forEach(weekFormService::deleteEmptyScheduleWeek);
        return deleted;
    }

    private void recalculateWeeks(Set<LocalDate> weekStarts) {
        weekStarts.forEach(weekFormService::recalculateWeekProjectTime);
    }

    private ScheduleEventVo getScheduleEvent(Integer id) {
        ProjectTimeDo projectTime = getSchedule(id);
        ScheduleEventVo scheduleEvent = new ScheduleEventVo();
        scheduleEvent.setId(projectTime.getId());
        scheduleEvent.setProjectId(projectTime.getProject().getId());
        scheduleEvent.setProjectName(projectTime.getProject().getName());
        scheduleEvent.setProjectColor(projectTime.getProject().getColor());
        scheduleEvent.setChecklistId(projectTime.getChecklistId());
        scheduleEvent.setChecklistName(projectTime.getChecklistName());
        scheduleEvent.setChecklistTypeColor(projectTime.getChecklistTypeColor());
        scheduleEvent.setChecklistIsDone(projectTime.getChecklistIsDone());
        scheduleEvent.setScheduleName(projectTime.getScheduleName());
        scheduleEvent.setDescription(projectTime.getDescription());
        scheduleEvent.setDate(projectTime.getDate());
        scheduleEvent.setEndDate(projectTime.getEndDate());
        scheduleEvent.setStartTime(projectTime.getStartTime());
        scheduleEvent.setEndTime(projectTime.getEndTime());
        return scheduleEvent;
    }

    private ProjectTimeDo getSchedule(Integer id) {
        ProjectTimeDo projectTime = projectTimeMapper.getScheduleById(id, getLoginUser().getId());
        if (projectTime == null) {
            throw new MethodParamInvalidException("日程不存在或无权操作");
        }
        return projectTime;
    }

    private ProjectDo getUserProject(Integer projectId) {
        if (projectId == null) {
            return getInboxProject();
        }
        ProjectDo project = projectMapper.getProject(projectId);
        if (project == null || !Objects.equals(project.getUserId(), getLoginUser().getId())) {
            throw new MethodParamInvalidException("项目不存在或无权操作");
        }
        return project;
    }

    private ProjectDo getInboxProject() {
        Integer userId = getLoginUser().getId();
        TypeDo inboxType = typeMapper.getRootTypeByName(INBOX_NAME, userId);
        if (inboxType == null) {
            inboxType = new TypeDo();
            inboxType.setName(INBOX_NAME);
            inboxType.setUserId(userId);
            typeMapper.addType(inboxType);
            inboxType = Objects.requireNonNull(typeMapper.getRootTypeByName(INBOX_NAME, userId));
        }
        ProjectDo inboxProject = projectMapper.getProjectByName(INBOX_NAME, userId);
        if (inboxProject != null) {
            return inboxProject;
        }
        inboxProject = new ProjectDo();
        inboxProject.setName(INBOX_NAME);
        inboxProject.setType(inboxType);
        inboxProject.setStartDate(LocalDate.now().format(DATE_FORMATTER));
        inboxProject.setProgress(0D);
        inboxProject.setState(ProjectState.STARTED);
        inboxProject.setImportant(0);
        inboxProject.setColor("#1677FF");
        inboxProject.setIsStartDateOnly(1);
        inboxProject.setUserId(userId);
        projectMapper.addProject(inboxProject);
        return Objects.requireNonNull(projectMapper.getProjectByName(INBOX_NAME, userId));
    }

    private ProjectTimeDo buildProjectTime(ScheduleEventParam param, ProjectDo project, ChecklistDo checklist,
                                           LocalDateTimeRange timeRange) {
        ProjectTimeDo projectTime = new ProjectTimeDo();
        projectTime.setProject(project);
        projectTime.setDate(timeRange.startDate().format(DATE_FORMATTER));
        projectTime.setEndDate(timeRange.endDate().format(DATE_FORMATTER));
        projectTime.setStartTime(timeRange.startTime().toString());
        projectTime.setEndTime(timeRange.endTime().toString());
        projectTime.setChecklistId(checklist == null ? null : checklist.getId());
        projectTime.setScheduleName(checklist == null ? param.getScheduleName().trim() : checklist.getName());
        projectTime.setDescription(param.getDescription());
        return projectTime;
    }

    private ChecklistDo getChecklist(Integer checklistId) {
        if (checklistId == null) {
            return null;
        }
        ChecklistDo checklist = checklistMapper.getByIdAndUserId(checklistId, getLoginUser().getId());
        if (checklist == null) {
            throw new MethodParamInvalidException("清单不存在或无权操作");
        }
        return checklist;
    }

    /**
     * 为拖入日程的项目创建默认收集箱清单。
     *
     * @param param 日程参数
     * @param project 已校验的关联项目
     * @param checklist 已关联的清单
     * @return 原有或新建的清单
     */
    private ChecklistDo createChecklistForProject(ScheduleEventParam param, ProjectDo project, ChecklistDo checklist) {
        if (checklist != null || !Boolean.TRUE.equals(param.getCreateChecklist())) {
            return checklist;
        }
        ChecklistDo createdChecklist = new ChecklistDo();
        createdChecklist.setName(param.getScheduleName().trim());
        createdChecklist.setProjectId(project.getId());
        createdChecklist.setIsDone(0);
        createdChecklist.setUserId(getLoginUser().getId());
        if (!checklistMapper.insert(createdChecklist)) {
            throw new DbOperateException("创建项目清单失败");
        }
        return createdChecklist;
    }

    /**
     * 将日程编辑后的标题同步到关联清单及其所有日程。
     *
     * @param checklist 当前关联清单；未关联清单时为空
     * @param scheduleName 用户输入的日程标题
     */
    private void updateChecklistName(ChecklistDo checklist, String scheduleName) {
        if (checklist == null || Objects.equals(checklist.getName(), scheduleName)) {
            return;
        }
        boolean updated = checklistMapper.updateNameByIdAndUserId(checklist.getId(), scheduleName, getLoginUser().getId());
        if (!updated) {
            throw new MethodParamInvalidException("清单名称更新失败");
        }
        checklist.setName(scheduleName);
        projectTimeMapper.updateScheduleNameByChecklistId(checklist.getId(), scheduleName);
    }

    private LocalDateTimeRange validateTimeRange(ScheduleEventParam param) {
        try {
            LocalDate startDate = LocalDate.parse(param.getDate(), DATE_FORMATTER);
            LocalDate endDate = LocalDate.parse(param.getEndDate(), DATE_FORMATTER);
            LocalTime startTime = LocalTime.parse(param.getStartTime(), TIME_FORMATTER);
            LocalTime endTime = LocalTime.parse(param.getEndTime(), TIME_FORMATTER);
            if (!LocalDateTime.of(endDate, endTime).isAfter(LocalDateTime.of(startDate, startTime))) {
                throw new MethodParamInvalidException("结束时间必须晚于开始时间");
            }
            return new LocalDateTimeRange(startDate, endDate, startTime, endTime);
        } catch (DateTimeParseException exception) {
            throw new MethodParamInvalidException("日程日期或时间格式错误");
        }
    }

    private Set<LocalDate> getWeekStarts(ProjectTimeDo projectTime) {
        LocalDate startDate = LocalDate.parse(projectTime.getDate(), DATE_FORMATTER);
        LocalDate endDate = projectTime.getEndDate() == null ? startDate
                : LocalDate.parse(projectTime.getEndDate(), DATE_FORMATTER);
        return getWeekStarts(new LocalDateTimeRange(startDate, endDate, LocalTime.MIN, LocalTime.MAX));
    }

    private Set<LocalDate> getWeekStarts(LocalDateTimeRange timeRange) {
        Set<LocalDate> weekStarts = new LinkedHashSet<>();
        LocalDate weekStart = getWeekStart(timeRange.startDate());
        LocalDate endWeekStart = getWeekStart(timeRange.endDate());
        while (!weekStart.isAfter(endWeekStart)) {
            weekStarts.add(weekStart);
            weekStart = weekStart.plusWeeks(1);
        }
        return weekStarts;
    }

    private LocalDate getWeekStart(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private UserDetail getLoginUser() {
        return Objects.requireNonNull(UserUtil.getLoginUser());
    }

    private record LocalDateTimeRange(LocalDate startDate, LocalDate endDate, LocalTime startTime, LocalTime endTime) {
    }
}

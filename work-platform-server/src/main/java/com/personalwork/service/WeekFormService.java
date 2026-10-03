package com.personalwork.service;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalwork.constants.ProblemLevel;
import com.personalwork.constants.ProblemState;
import com.personalwork.dao.*;
import com.personalwork.domain.dto.WeekFormDto;
import com.personalwork.domain.entity.*;
import com.personalwork.domain.query.WeekFormParam;
import com.personalwork.exception.ProblemAddException;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.system.cache.RedisKeyConstants;
import com.personalwork.util.RedisUtil;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * @author 姚礼林
 * @desc 周记录表单业务
 * @date 2023/8/26
 */
@Service
@RequiredArgsConstructor
public class WeekFormService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private final ProjectTimeMapper projectTimeMapper;
    private final ProjectMapper projectMapper;
    private final RecordWeekMapper recordWeekMapper;
    private final WeekProjectTimeCountMapper countMapper;
    private final ProblemMapper problemMapper;
    private final MonthCountService monthCountService;
    private final ProjectProgressWeekService projectProgressWeekService;
    private final RedisUtil redisUtil;


    @Transactional(rollbackFor = Exception.class)
    public Integer createForm(WeekFormParam param) {
        insertRecordWeek(param);
        RecordWeekDo returnWeek = recordWeekMapper.getWorkWeekByDate(param.getDate(),getLoginUser().getId());
        insertProjectTimeCount(returnWeek.getId(), param);
        insertProjectTime(returnWeek.getId(), param);
        insertProblems(param.getProblems());
        handleProjectProgressSave(param,returnWeek.getId());
        // 重新对本月的数据进行统计
        String[] date = param.getDate().split("-");
        int year = Integer.parseInt(date[0]);
        int month = Integer.parseInt(date[1]);
        monthCountService.countMonthProjectTime(year,month);
        deleteWeekListCache();
        return returnWeek.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean saveForm(Integer id, WeekFormParam param) {
        boolean preserveScheduleTimes = Boolean.TRUE.equals(param.getPreserveScheduleTimes());
        if (!preserveScheduleTimes) {
            projectTimeMapper.deleteWeekProjectTime(id);
            countMapper.deleteByWeek(id);
        }
        RecordWeekDo recordWeekDo = convertToRecordWeekDo(param);
        recordWeekDo.setId(id);
        if (preserveScheduleTimes) {
            recordWeekDo.setTime(recordWeekMapper.getWorkWeekById(id).getTime());
        }
        recordWeekMapper.updateWorkWeek(recordWeekDo);
        insertProblems(param.getAddProblems());
        if (!preserveScheduleTimes) {
            insertProjectTimeCount(id, param);
            insertProjectTime(id, param);
        }
        handleProjectProgressSave(param,id);
        // 重新对本月的数据进行统计
        String[] date = param.getDate().split("-");
        int year = Integer.parseInt(date[0]);
        int month = Integer.parseInt(date[1]);
        monthCountService.countMonthProjectTime(year,month);
        deleteWeekListCache();
        return true;
    }

    public WeekFormDto getWeekForm(Integer weekId) {
        RecordWeekDo recordWeekDo = recordWeekMapper.getWorkWeekById(weekId);
        List<ProjectTimeDo> projectTimeDoList = projectTimeMapper.getProjectTimeByWeek(weekId);
        List<ProblemDo> problemDos = problemMapper.getProblemsByWeekDate(recordWeekDo.getDate()
            ,getLoginUser().getId());
        List<ProjectProgressWeekDo> projectProgressWeekDos = projectProgressWeekService.list(weekId);
        WeekFormDto weekFormDto = new WeekFormDto();
        weekFormDto.setWeekDo(recordWeekDo);
        weekFormDto.setProblemDos(problemDos);
        weekFormDto.setProjectTimeDos(projectTimeDoList);
        weekFormDto.setProjectProgressList(projectProgressWeekDos);
        return weekFormDto;
    }

    public boolean isExist(String date) {
        RecordWeekDo recordWeekDo = recordWeekMapper.getWorkWeekByDate(date,getLoginUser().getId());
        return recordWeekDo != null;
    }

    /**
     * 获取指定周的记录，不存在时仅创建包含周一日期的空记录。
     *
     * @param weekStart 周一日期
     * @return 周记录
     */
    public RecordWeekDo ensureWeekForm(LocalDate weekStart) {
        String weekDate = weekStart.format(DATE_FORMATTER);
        RecordWeekDo recordWeek = recordWeekMapper.getWorkWeekByDate(weekDate, getLoginUser().getId());
        if (recordWeek != null) {
            return recordWeek;
        }
        RecordWeekDo emptyWeek = new RecordWeekDo();
        emptyWeek.setDate(weekDate);
        emptyWeek.setTime(0);
        emptyWeek.setUserId(getLoginUser().getId());
        recordWeekMapper.addWorkWeek(emptyWeek);
        return Objects.requireNonNull(recordWeekMapper.getWorkWeekByDate(weekDate, getLoginUser().getId()));
    }

    /**
     * 重新计算指定周内每个项目和全部项目的工作时长。<br>
     * <p>跨周日程只统计与当前周重叠的时间范围。</p>
     *
     * @param weekStart 周一日期
     */
    public void recalculateWeekProjectTime(LocalDate weekStart) {
        RecordWeekDo recordWeek = ensureWeekForm(weekStart);
        WeekMinutes weekMinutes = calculateWeekProjectMinutes(weekStart);
        Map<Integer, Integer> projectMinutes = weekMinutes.projectMinutes();
        countMapper.deleteByWeek(recordWeek.getId());
        projectMinutes.forEach((projectId, minutes) -> {
            WeekProjectTimeCountDo timeCount = new WeekProjectTimeCountDo();
            timeCount.setWeekId(recordWeek.getId());
            timeCount.setProject(projectId);
            timeCount.setMinutes(minutes);
            countMapper.add(timeCount);
        });
        recordWeek.setTime(weekMinutes.totalMinutes());
        recordWeekMapper.updateWorkWeek(recordWeek);
        monthCountService.countMonthProjectTime(weekStart.getYear(), weekStart.getMonthValue());
        LocalDate weekEnd = weekStart.plusDays(6);
        if (weekEnd.getMonthValue() != weekStart.getMonthValue()) {
            monthCountService.countMonthProjectTime(weekEnd.getYear(), weekEnd.getMonthValue());
        }
        deleteScheduleCaches();
    }

    /**
     * 删除仅由日程自动创建且不再包含任何日程、总结或评价的周记录。
     *
     * @param weekStart 周一日期
     */
    public void deleteEmptyScheduleWeek(LocalDate weekStart) {
        RecordWeekDo recordWeek = recordWeekMapper.getWorkWeekByDate(weekStart.format(DATE_FORMATTER), getLoginUser().getId());
        if (recordWeek == null || hasScheduleInWeek(weekStart) || StringUtils.hasText(recordWeek.getSummary())
                || recordWeek.getMark() != null) {
            return;
        }
        countMapper.deleteByWeek(recordWeek.getId());
        recordWeekMapper.deleteWorkWeek(recordWeek.getId());
        deleteScheduleCaches();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Integer weekId) {
        projectTimeMapper.deleteWeekProjectTime(weekId);
        countMapper.deleteByWeek(weekId);
        recordWeekMapper.deleteWorkWeek(weekId);
        deleteWeekListCache();
        return true;
    }

    private void handleProjectProgressSave(WeekFormParam param,Integer weekId) {
        // 先删除该周的全部项目进度记录
        projectProgressWeekService.remove(new LambdaQueryWrapper<ProjectProgressWeekDo>()
                .eq(ProjectProgressWeekDo::getWeekId, weekId));
        // 再重新添加记录
        if (CollUtil.isNotEmpty(param.getProjectProgressList())) {
            param.getProjectProgressList().forEach(i -> {
                ProjectProgressWeekDo projectProgressWeekDo = new ProjectProgressWeekDo();
                BeanUtil.copyProperties(i, projectProgressWeekDo);
                projectProgressWeekDo.setWeekId(weekId);
                projectProgressWeekDo.setUserId(getLoginUser().getId());
                projectProgressWeekDo.setId(null);
                projectProgressWeekService.save(projectProgressWeekDo);
            });
        }
    }

    private void insertProblems(List<WeekFormParam.Problem> problems) {
        UserDetail loginUser = getLoginUser();
        problems.forEach(i -> {
            if (problemMapper.getOpenProblemByName(i.getTitle(),loginUser.getId()) != null) {
                throw new ProblemAddException("已存在相同的问题，问题：" + i.getTitle());
            }
            ProblemDo problemDo = new ProblemDo();
            BeanUtils.copyProperties(i, problemDo);
            problemDo.setState(ProblemState.UN_RESOLVE);
            problemDo.setUserId(loginUser.getId());
            if (problemDo.getLevel() == null) {
                problemDo.setLevel(ProblemLevel.NORMAL);
            }
            problemMapper.add(problemDo);
        });
    }

    private void deleteWeekListCache() {
        redisUtil.delete(RedisKeyConstants.WEEK_LIST_KEY + getLoginUser().getId());
    }

    private void deleteScheduleCaches() {
        Integer userId = getLoginUser().getId();
        redisUtil.deleteByPattern(RedisKeyConstants.WEEK_LIST_KEY + "*user:" + userId);
        redisUtil.deleteByPattern(RedisKeyConstants.WEEK_FORM_KEY + "*user:" + userId);
        redisUtil.deleteByPattern(RedisKeyConstants.MONTH_LIST_KEY + "*user:" + userId);
    }

    private boolean hasScheduleInWeek(LocalDate weekStart) {
        return !projectTimeMapper.getProjectTimesByWeekRange(weekStart.format(DATE_FORMATTER),
                weekStart.plusDays(7).format(DATE_FORMATTER), getLoginUser().getId()).isEmpty();
    }

    private WeekMinutes calculateWeekProjectMinutes(LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(7);
        List<ProjectTimeDo> projectTimes = projectTimeMapper.getProjectTimesByWeekRange(
                weekStart.format(DATE_FORMATTER), weekEnd.format(DATE_FORMATTER), getLoginUser().getId());
        Map<Integer, Integer> projectMinutes = new HashMap<>(projectTimes.size());
        int totalMinutes = 0;
        for (ProjectTimeDo projectTime : projectTimes) {
            int minutes = calculateOverlapMinutes(projectTime, weekStart, weekEnd);
            if (minutes > 0) {
                totalMinutes += minutes;
                if (projectTime.getProject() != null) {
                    Integer projectId = projectTime.getProject().getId();
                    projectMinutes.merge(projectId, minutes, Integer::sum);
                }
            }
        }
        return new WeekMinutes(projectMinutes, totalMinutes);
    }

    private record WeekMinutes(Map<Integer, Integer> projectMinutes, int totalMinutes) {
    }

    private int calculateOverlapMinutes(ProjectTimeDo projectTime, LocalDate weekStart, LocalDate weekEnd) {
        LocalDate startDate = LocalDate.parse(projectTime.getDate(), DATE_FORMATTER);
        LocalDate endDate = projectTime.getEndDate() == null ? startDate
                : LocalDate.parse(projectTime.getEndDate(), DATE_FORMATTER);
        LocalDateTime scheduleStart = LocalDateTime.of(startDate, LocalTime.parse(projectTime.getStartTime()));
        LocalDateTime scheduleEnd = LocalDateTime.of(endDate, LocalTime.parse(projectTime.getEndTime()));
        if (!scheduleEnd.isAfter(scheduleStart)) {
            scheduleEnd = scheduleEnd.plusDays(1);
        }
        LocalDateTime weekStartTime = weekStart.atStartOfDay();
        LocalDateTime weekEndTime = weekEnd.atStartOfDay();
        LocalDateTime overlapStart = scheduleStart.isAfter(weekStartTime) ? scheduleStart : weekStartTime;
        LocalDateTime overlapEnd = scheduleEnd.isBefore(weekEndTime) ? scheduleEnd : weekEndTime;
        return overlapEnd.isAfter(overlapStart) ? Math.toIntExact(Duration.between(overlapStart, overlapEnd).toMinutes()) : 0;
    }

    private void insertRecordWeek(WeekFormParam param) {
        UserDetail loginUser = getLoginUser();
        RecordWeekDo recordWeekDo = convertToRecordWeekDo(param);
        recordWeekDo.setUserId(loginUser.getId());
        recordWeekMapper.addWorkWeek(recordWeekDo);
    }

    private  UserDetail getLoginUser() {
        return Objects.requireNonNull(UserUtil.getLoginUser());
    }

    private void insertProjectTime(int weekId, WeekFormParam param) {
        List<WeekFormParam.ProjectTime> projectTimeList = param.getProjectTimeList();
        for (WeekFormParam.ProjectTime item : projectTimeList) {
            ProjectTimeDo projectTimeDo = new ProjectTimeDo();
            ProjectDo project = projectMapper.getProject(item.getProject());
            projectTimeDo.setProject(project);
            projectTimeDo.setDate(item.getDate());
            projectTimeDo.setStartTime(item.getStartTime());
            projectTimeDo.setEndTime(item.getEndTime());
            projectTimeDo.setWeekId(weekId);
            projectTimeMapper.insert(projectTimeDo);
        }
    }

    private void insertProjectTimeCount(int weekId, WeekFormParam param) {
        List<WeekFormParam.TaskCountItem> taskCountItems = param.getTaskCount().getItems();
        for (WeekFormParam.TaskCountItem item : taskCountItems) {
            WeekProjectTimeCountDo timeCount = new WeekProjectTimeCountDo();
            timeCount.setWeekId(weekId);
            timeCount.setProject(item.getProject());
            timeCount.setMinutes(item.getMinutes());
            countMapper.add(timeCount);
        }
    }

    private RecordWeekDo convertToRecordWeekDo(WeekFormParam param) {
        RecordWeekDo recordWeekDo = new RecordWeekDo();
        recordWeekDo.setDate(param.getDate());
        recordWeekDo.setTime(param.getTaskCount().getTotalMinutes());
        recordWeekDo.setMark(param.getMark());
        recordWeekDo.setSummary(param.getSummary());
        return recordWeekDo;
    }
}

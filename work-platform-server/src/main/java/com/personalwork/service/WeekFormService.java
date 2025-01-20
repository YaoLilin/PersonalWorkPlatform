package com.personalwork.service;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalwork.constants.ProblemLevel;
import com.personalwork.constants.ProblemState;
import com.personalwork.dao.*;
import com.personalwork.exception.ProblemAddException;
import com.personalwork.modal.dto.WeekFormDto;
import com.personalwork.modal.entity.*;
import com.personalwork.modal.query.WeekFormParam;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.system.cache.RedisKeyConstants;
import com.personalwork.util.RedisUtil;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * @author 姚礼林
 * @desc 周记录表单业务
 * @date 2023/8/26
 */
@Service
@RequiredArgsConstructor
public class WeekFormService {
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
        projectTimeMapper.deleteWeekProjectTime(id);
        countMapper.deleteByWeek(id);
        RecordWeekDo recordWeekDo = convertToRecordWeekDo(param);
        recordWeekDo.setId(id);
        recordWeekMapper.updateWorkWeek(recordWeekDo);
        insertProblems(param.getAddProblems());
        insertProjectTimeCount(id, param);
        insertProjectTime(id, param);
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

package com.personalwork.service;

import com.personalwork.dao.*;
import com.personalwork.enu.ProblemLevel;
import com.personalwork.enu.ProblemState;
import com.personalwork.exception.ProblemAddException;
import com.personalwork.modal.dto.WeekFormDto;
import com.personalwork.modal.entity.*;
import com.personalwork.modal.query.WeekFormParam;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/8/26
 */
@Service
public class WeekFormService {

    private final ProjectTimeMapper projectTimeMapper;

    private final ProjectMapper projectMapper;

    private final RecordWeekMapper recordWeekMapper;

    private final WeekProjectTimeCountMapper countMapper;

    private final ProblemMapper problemMapper;
    private MonthCountService monthCountService;

    @Autowired
    public WeekFormService(ProjectTimeMapper projectTimeMapper, ProjectMapper projectMapper, RecordWeekMapper recordWeekMapper,
                           WeekProjectTimeCountMapper countMapper, ProblemMapper problemMapper,MonthCountService monthCountService) {
        this.projectTimeMapper = projectTimeMapper;
        this.projectMapper = projectMapper;
        this.recordWeekMapper = recordWeekMapper;
        this.countMapper = countMapper;
        this.problemMapper = problemMapper;
        this.monthCountService = monthCountService;
    }

    @Transactional(rollbackFor = Exception.class)
    public Integer createForm(WeekFormParam param) {
        RecordWeekDo recordWeekDo = convertToRecordWeekDo(param);
        recordWeekMapper.addWorkWeek(recordWeekDo);
        RecordWeekDo returnWeek = recordWeekMapper.getWorkWeekByDate(param.getDate());

        insertProjectTimeCount(returnWeek.getId(), param);
        insertProjectTime(returnWeek.getId(), param);
        insertProblems(param.getProblems());
        // 重新对本月的数据进行统计
        String[] date = param.getDate().split("-");
        int year = Integer.parseInt(date[0]);
        int month = Integer.parseInt(date[1]);
        monthCountService.countMonthProjectTime(year,month);
        return returnWeek.getId();

    }

    @Transactional(rollbackFor = Exception.class)
    public boolean saveForm(Integer id, WeekFormParam param) {
        projectTimeMapper.deleteWeekProjectTime(id);
        countMapper.delete(id);

        RecordWeekDo recordWeekDo = convertToRecordWeekDo(param);
        recordWeekDo.setId(id);
        recordWeekMapper.updateWorkWeek(recordWeekDo);
        insertProblems(param.getAddProblems());

        insertProjectTimeCount(id, param);
        insertProjectTime(id, param);
        // 重新对本月的数据进行统计
        String[] date = param.getDate().split("-");
        int year = Integer.parseInt(date[0]);
        int month = Integer.parseInt(date[1]);
        monthCountService.countMonthProjectTime(year,month);
        return true;
    }

    private void insertProblems(List<WeekFormParam.Problem> problems) {
        problems.forEach(i -> {
            if (problemMapper.getOpenProblemByName(i.getTitle()) != null) {
                throw new ProblemAddException("已存在相同的问题，问题：" + i.getTitle());
            }
            ProblemDo problemDo = new ProblemDo();
            BeanUtils.copyProperties(i, problemDo);
            problemDo.setState(ProblemState.UN_RESOLVE);
            if (problemDo.getLevel() == null) {
                problemDo.setLevel(ProblemLevel.NORMAL);
            }
            problemMapper.add(problemDo);
        });
    }

    public WeekFormDto getWeekForm(Integer weekId) {
        RecordWeekDo recordWeekDo = recordWeekMapper.getWorkWeekById(weekId);
        List<ProjectTimeDo> projectTimeDoList = projectTimeMapper.getProjectTimeByWeek(weekId);
        List<ProblemDo> problemDos = problemMapper.getProblemsByWeekDate(recordWeekDo.getDate());
        WeekFormDto weekFormDto = new WeekFormDto();
        weekFormDto.setWeekDo(recordWeekDo);
        weekFormDto.setProblemDos(problemDos);
        weekFormDto.setProjectTimeDos(projectTimeDoList);

        return weekFormDto;
    }

    public boolean isExist(String date) {
        RecordWeekDo recordWeekDo = recordWeekMapper.getWorkWeekByDate(date);
        return recordWeekDo != null;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean delete(String weekId) {
        projectTimeMapper.deleteWeekProjectTime(Integer.parseInt(weekId));
        countMapper.delete(Integer.parseInt(weekId));
        recordWeekMapper.deleteWorkWeek(weekId);
        return true;
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
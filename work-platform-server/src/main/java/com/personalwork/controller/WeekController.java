package com.personalwork.controller;

import com.alibaba.fastjson.JSONObject;
import com.personalwork.modal.dto.WeekFormDto;
import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.entity.ProjectTimeDo;
import com.personalwork.modal.entity.RecordWeekDo;
import com.personalwork.modal.query.WeekFormParam;
import com.personalwork.modal.vo.*;
import com.personalwork.service.ProblemsService;
import com.personalwork.service.ProjectService;
import com.personalwork.service.WeekFormService;
import com.personalwork.service.WeekListService;
import com.personalwork.system.cache.Cache;
import com.personalwork.system.cache.DeleteCache;
import com.personalwork.system.cache.RedisKeyConstants;
import com.personalwork.validation.constraints.ValidDate;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * @author 姚礼林
 * @desc 周记录接口
 * @date 2023/8/19
 */
@RestController
@RequestMapping("/statistics/weeks")
public class WeekController {

    private final WeekFormService formService;
    private final WeekListService weekListService;
    private final ProblemsService problemsService;
    private final ProjectService projectService;

    @Autowired
    public WeekController(WeekFormService formService, WeekListService weekListService, ProblemsService problemsService,
                          ProjectService projectService) {
        this.formService = formService;
        this.weekListService = weekListService;
        this.problemsService = problemsService;
        this.projectService = projectService;
    }

    @PutMapping("/{id}")
    @DeleteCache(value = {RedisKeyConstants.WEEK_LIST_KEY, RedisKeyConstants.WEEK_FORM_KEY
            , RedisKeyConstants.MONTH_LIST_KEY}, isUserData = true)
    public boolean saveForm(@PathVariable Integer id, @RequestBody @Validated WeekFormParam params) {
        return formService.saveForm(id, params);
    }

    @PostMapping
    @DeleteCache(value = {RedisKeyConstants.WEEK_LIST_KEY, RedisKeyConstants.MONTH_LIST_KEY}, isUserData = true)
    public String createForm(@RequestBody @Validated WeekFormParam params) {
        Integer id = formService.createForm(params);
        JSONObject result = new JSONObject();
        result.put("id", id);
        return result.toJSONString();
    }

    @GetMapping("/is-exists")
    public String isWeekExists(@RequestParam @ValidDate String date) {
        JSONObject result = new JSONObject();
        result.put("result", formService.isExist(date));
        return result.toJSONString();
    }

    @GetMapping("/{id}")
    @Cache(key = RedisKeyConstants.WEEK_FORM_KEY, isUserData = true)
    public WeekFormVo loadForm(@PathVariable Integer id) {
        WeekFormDto weekFormDto = formService.getWeekForm(id);
        WeekFormVo weekFormVo = buildWeekFormVo(weekFormDto);
        List<ProjectTimeDo> projectTimeDoList = weekFormDto.getProjectTimeDos();
        List<ProjectTimeVo> projectTimeList = convertToProjectTimeVoList(projectTimeDoList);
        weekFormVo.setProjectTime(projectTimeList);
        List<ProblemDo> problemDos = weekFormDto.getProblemDos();
        List<ProblemInFormVo> problemInFormList = convertToProblemInFormVo(problemDos);
        weekFormVo.setTheWeekProblems(problemInFormList);
        List<ProblemDo> doList = problemsService.getProblemsExceptThisWeek(id);
        List<ProblemInFormVo> otherProblems = convertToProblemInFormVo(doList);
        weekFormVo.setNowProblems(otherProblems);
        List<ProjectProgressWeekVo> projectProgressWeekVos = getProjectProgressWeekVos(weekFormDto);
        weekFormVo.setProjectProgressList(projectProgressWeekVos);
        return weekFormVo;
    }

    @GetMapping
    @Cache(key = RedisKeyConstants.WEEK_LIST_KEY, expire = RedisKeyConstants.WEEK_LIST_TTL,
            isUserData = true, listElementType = WeeksVo.class)
    public List<WeeksVo> getWeekCardList() {
        return weekListService.getCardList();
    }

    @DeleteMapping("/{id}")
    @DeleteCache(value = {RedisKeyConstants.WEEK_LIST_KEY, RedisKeyConstants.WEEK_FORM_KEY,
            RedisKeyConstants.MONTH_LIST_KEY}, isUserData = true)
    public boolean delete(@PathVariable Integer id) {
        return formService.delete(id);
    }

    private List<ProblemInFormVo> convertToProblemInFormVo(List<ProblemDo> problemDos) {
        return problemDos.stream().map(i -> {
            ProblemInFormVo vo = new ProblemInFormVo();
            BeanUtils.copyProperties(i, vo);
            return vo;
        }).toList();
    }

    private List<ProjectTimeVo> convertToProjectTimeVoList(List<ProjectTimeDo> projectTimeDoList) {
        return projectTimeDoList.stream().map(i -> {
            ProjectTimeVo vo = new ProjectTimeVo();
            BeanUtils.copyProperties(i, vo);
            BrowserObject browserObject = new BrowserObject(i.getProject().getId(), i.getProject().getName());
            vo.setProject(browserObject);
            return vo;
        }).toList();
    }

    private WeekFormVo buildWeekFormVo(WeekFormDto weekFormDto) {
        WeekFormVo weekFormVo = new WeekFormVo();
        RecordWeekDo recordWeekDo = weekFormDto.getWeekDo();
        weekFormVo.setDate(recordWeekDo.getDate());
        weekFormVo.setMark(recordWeekDo.getMark());
        weekFormVo.setSummary(recordWeekDo.getSummary());
        return weekFormVo;
    }

    private List<ProjectProgressWeekVo> getProjectProgressWeekVos(WeekFormDto weekFormDto) {
        if (weekFormDto.getProjectProgressList() == null) {
            return Collections.emptyList();
        }
        List<ProjectProgressWeekVo> projectProgressWeekVos =
                weekFormDto.getProjectProgressList().stream()
                        .map(i -> {
                            ProjectProgressWeekVo vo = new ProjectProgressWeekVo();
                            BeanUtils.copyProperties(i, vo);
                            return vo;
                        })
                        .toList();
        for (ProjectProgressWeekVo projectProgressWeekVo : projectProgressWeekVos) {
            projectProgressWeekVo.setProjectName(
                    projectService.getProject(projectProgressWeekVo.getProjectId()).getName());
        }
        return projectProgressWeekVos;
    }

}

package com.personalwork.controller;

import com.personalwork.modal.dto.WeekGoalDto;
import com.personalwork.modal.query.WeekGoalParam;
import com.personalwork.modal.query.WeekGoalQueryParam;
import com.personalwork.modal.vo.GoalVo;
import com.personalwork.modal.vo.WeekGoalVo;
import com.personalwork.service.impl.WeekGoalServiceImpl;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * @author 姚礼林
 * @desc 周目标相关接口
 * @date 2024/5/3
 */
@RestController
@RequestMapping("/week-goals")
public class WeekGoalController extends GoalController{

    private final WeekGoalServiceImpl weekGoalService;

    @Autowired
    public WeekGoalController(WeekGoalServiceImpl weekGoalServiceImpl) {
        super(weekGoalServiceImpl);
        this.weekGoalService = weekGoalServiceImpl;
    }

    @GetMapping
    public List<WeekGoalVo> getWeekGoals(WeekGoalQueryParam param) {
        List<WeekGoalDto> weekGoalDtoList = weekGoalService.getGoals(param);
        List<WeekGoalVo> result = new ArrayList<>();
        weekGoalDtoList.forEach(i -> {
            Optional<WeekGoalVo> opt = result.stream().filter(g -> g.getYear().equals(i.getYear()) && g.getWeekNumber().equals(i.getWeekNumber()))
                    .findAny();
            if (opt.isPresent()) {
                WeekGoalVo weekGoalVo = opt.get();
                GoalVo.GoalItem item = new WeekGoalVo.GoalItem();
                BeanUtils.copyProperties(i, item);
                item.setProjectId(i.getProject().getId());
                item.setProjectName(i.getProject().getName());
                weekGoalVo.getGoals().add(item);
            } else {
                WeekGoalVo vo = new WeekGoalVo();
                vo.setYear(i.getYear());
                vo.setWeekNumber(i.getWeekNumber());
                List<GoalVo.GoalItem> itemList = new ArrayList<>();
                GoalVo.GoalItem item = new WeekGoalVo.GoalItem();
                BeanUtils.copyProperties(i, item);
                item.setProjectId(i.getProject().getId());
                item.setProjectName(i.getProject().getName());
                itemList.add(item);
                vo.setGoals(itemList);
                result.add(vo);
            }
        });
        return result;
    }

    @PostMapping
    public boolean insertGoal(@RequestBody @Validated WeekGoalParam param) {
        param.setIsDone(0);
        return weekGoalService.insertGoal(param);
    }


}

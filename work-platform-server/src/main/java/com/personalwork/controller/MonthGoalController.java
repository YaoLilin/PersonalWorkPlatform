package com.personalwork.controller;

import com.personalwork.modal.dto.MonthGoalDto;
import com.personalwork.modal.query.MonthGoalParam;
import com.personalwork.modal.query.MonthGoalQueryParam;
import com.personalwork.modal.vo.MonthGoalVo;
import com.personalwork.modal.vo.WeekGoalVo;
import com.personalwork.service.impl.MonthGoalServiceImpl;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/5/5
 */
@RestController
@RequestMapping("/month-goals")
public class MonthGoalController extends GoalController{
    private final MonthGoalServiceImpl monthGoalService;

    public MonthGoalController(MonthGoalServiceImpl goalService) {
        super(goalService);
        this.monthGoalService = goalService;
    }

    @GetMapping
    public List<MonthGoalVo> getWeekGoals(MonthGoalQueryParam param) {
        List<MonthGoalDto> monthGoalDtoList = monthGoalService.getGoals(param);
        List<MonthGoalVo> result = new ArrayList<>();
        monthGoalDtoList.forEach(i -> {
            Optional<MonthGoalVo> opt = result.stream().filter(g -> g.getYear().equals(i.getYear()) && g.getMonth().equals(i.getMonth()))
                    .findAny();
            if (opt.isPresent()) {
                MonthGoalVo monthGoalVo = opt.get();
                WeekGoalVo.GoalItem item = convertGoalItem(i);
                monthGoalVo.getGoals().add(item);
            } else {
                MonthGoalVo vo = new MonthGoalVo();
                vo.setYear(i.getYear());
                vo.setMonth(i.getMonth());
                MonthGoalVo.GoalItem item = convertGoalItem(i);
                List<MonthGoalVo.GoalItem> itemList = new ArrayList<>();
                itemList.add(item);
                vo.setGoals(itemList);
                result.add(vo);
            }
        });
        return result;
    }

    private  MonthGoalVo.GoalItem convertGoalItem(MonthGoalDto i) {
        MonthGoalVo.GoalItem item = new MonthGoalVo.GoalItem();
        BeanUtils.copyProperties(i, item);
        item.setProjectId(i.getProject().getId());
        item.setProjectName(i.getProject().getName());
        return item;
    }

    @PostMapping
    public boolean insertGoal(@RequestBody @Validated MonthGoalParam param) {
        param.setIsDone(0);
        return monthGoalService.insertGoal(param);
    }
}

package com.personalwork.controller;

import cn.hutool.core.bean.BeanUtil;
import com.personalwork.modal.dto.MonthGoalDto;
import com.personalwork.modal.entity.MonthGoalDo;
import com.personalwork.modal.query.MonthGoalParam;
import com.personalwork.modal.query.MonthGoalQueryParam;
import com.personalwork.modal.vo.GoalVo;
import com.personalwork.modal.vo.MonthGoalVo;
import com.personalwork.service.impl.MonthGoalServiceImpl;
import com.personalwork.util.UserUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * @author 姚礼林
 * @desc 月目标接口
 * @date 2024/5/5
 */
@RestController
@RequestMapping("/month-goals")
public class MonthGoalController {
    private final MonthGoalServiceImpl monthGoalService;

    public MonthGoalController(MonthGoalServiceImpl goalService) {
        this.monthGoalService = goalService;
    }

    @GetMapping
    public List<MonthGoalVo> getWeekGoals(MonthGoalQueryParam param) {
        List<MonthGoalDto> monthGoalDtoList = monthGoalService.getGoals(param);
        List<MonthGoalVo> result = new ArrayList<>();
        monthGoalDtoList.forEach(i -> {
            Optional<MonthGoalVo> opt = result.stream().filter(g -> g.getYear().equals(i.getYear())
                            && g.getMonth().equals(i.getMonth()))
                    .findAny();
            if (opt.isPresent()) {
                MonthGoalVo monthGoalVo = opt.get();
                GoalVo.GoalItem item = convertGoalItem(i);
                monthGoalVo.getGoals().add(item);
            } else {
                MonthGoalVo vo = new MonthGoalVo();
                vo.setYear(i.getYear());
                vo.setMonth(i.getMonth());
                GoalVo.GoalItem item = convertGoalItem(i);
                List<GoalVo.GoalItem> itemList = new ArrayList<>();
                itemList.add(item);
                vo.setGoals(itemList);
                result.add(vo);
            }
        });
        return result;
    }

    @PostMapping
    public boolean insertGoal(@RequestBody @Validated MonthGoalParam param) {
        param.setIsDone(0);
        MonthGoalDo monthGoalDo = BeanUtil.copyProperties(param, MonthGoalDo.class);
        monthGoalDo.setUserId(UserUtil.getLoginUserId());
        return monthGoalService.save(monthGoalDo);
    }

    @DeleteMapping("/{ids}")
    public boolean batchDelete(@Validated @NotBlank @PathVariable String ids) {
        Arrays.stream(ids.split(",")).forEach(i -> monthGoalService.removeById(Integer.parseInt(i)));
        return true;
    }

    @PutMapping("/{id}/change-state")
    public boolean changeState(@RequestBody @NotNull Map<String , Integer> params, @PathVariable String id) {
        return monthGoalService.changeState(Integer.parseInt(id), params.get("state"));
    }

    private  GoalVo.GoalItem convertGoalItem(MonthGoalDto i) {
        GoalVo.GoalItem item = new MonthGoalVo.GoalItem();
        BeanUtils.copyProperties(i, item);
        item.setProjectId(i.getProject().getId());
        item.setProjectName(i.getProject().getName());
        return item;
    }
}

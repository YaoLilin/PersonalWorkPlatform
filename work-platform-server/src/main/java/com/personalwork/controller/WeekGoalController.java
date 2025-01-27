package com.personalwork.controller;

import cn.hutool.core.bean.BeanUtil;
import com.personalwork.exception.DbOperateException;
import com.personalwork.modal.dto.WeekGoalDto;
import com.personalwork.modal.entity.WeekGoalDo;
import com.personalwork.modal.query.WeekGoalParam;
import com.personalwork.modal.query.WeekGoalQueryParam;
import com.personalwork.modal.vo.WeekGoalVo;
import com.personalwork.service.impl.WeekGoalServiceImpl;
import com.personalwork.util.UserUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * @author 姚礼林
 * @desc 周目标相关接口
 * @date 2024/5/3
 */
@RestController
@RequestMapping("/week-goals")
public class WeekGoalController {

    private final WeekGoalServiceImpl goalService;

    @Autowired
    public WeekGoalController(WeekGoalServiceImpl weekGoalServiceImpl) {
        this.goalService = weekGoalServiceImpl;
    }

    @GetMapping
    public List<WeekGoalVo> getWeekGoals(WeekGoalQueryParam param) {
        List<WeekGoalDto> weekGoalDtoList = goalService.getGoals(param);
        return getWeekGoalVos(weekGoalDtoList);
    }

    @PostMapping
    public Map<String ,Object> insertGoal(@RequestBody @Validated WeekGoalParam param) {
        param.setIsDone(0);
        WeekGoalDo weekGoalDo = BeanUtil.copyProperties(param, WeekGoalDo.class);
        weekGoalDo.setUserId(UserUtil.getLoginUserId());
        if (!goalService.save(weekGoalDo)) {
            throw new DbOperateException("插入失败");
        }
        WeekGoalDo newGoal = goalService.getGoalByContent(weekGoalDo.getWeekDate(), weekGoalDo.getContent());
        if (newGoal == null) {
            throw new NullPointerException("找不到新插入的目标");
        }
        Map<String, Object> result = new HashMap<>(1);
        result.put("id", newGoal.getId());
        return result;
    }

    @DeleteMapping("/{ids}")
    public boolean batchDelete(@Validated @NotBlank @PathVariable String ids) {
        Arrays.stream(ids.split(",")).forEach(i -> goalService.removeById(Integer.parseInt(i)));
        return true;
    }

    @PutMapping("/{id}/change-state")
    public boolean changeState(@RequestBody @NotNull Map<String ,Integer> params, @PathVariable String id) {
        return goalService.changeState(Integer.parseInt(id), params.get("state"));
    }

    private static List<WeekGoalVo> getWeekGoalVos(List<WeekGoalDto> weekGoalDtoList) {
        Map<String, List<WeekGoalVo.Item>> goalMap = new LinkedHashMap<>(10);
        for (WeekGoalDto goal : weekGoalDtoList) {
            WeekGoalVo.Item item = BeanUtil.copyProperties(goal, WeekGoalVo.Item.class);
            item.setProjectId(goal.getProject().getId());
            item.setProjectName(goal.getProject().getName());
            goalMap.computeIfAbsent(goal.getWeekDate(), key -> new ArrayList<>()).add(item);
        }
        List<WeekGoalVo> result = new ArrayList<>();
        goalMap.forEach((key, value) -> {
            WeekGoalVo weekGoalVo = new WeekGoalVo();
            weekGoalVo.setWeekDate(key);
            weekGoalVo.setGoals(value);
            result.add(weekGoalVo);
        });
        return result;
    }
}

package com.personalwork.controller;

import com.personalwork.service.impl.BaseGoalServiceImpl;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * @author 姚礼林
 * @desc 目标相关接口
 * @date 2024/5/5
 */
public class GoalController {

    protected final BaseGoalServiceImpl goalService;

    public GoalController(BaseGoalServiceImpl goalService) {
        this.goalService = goalService;
    }


    @DeleteMapping("/{ids}")
    public boolean batchDelete(@PathVariable String ids) {
        List<Integer> idList = Arrays.stream(ids.split(",")).map(Integer::parseInt).toList();
        return goalService.batchDelete(idList);
    }

    @PutMapping("/{id}/change-state")
    public boolean changeState(@RequestBody @NotNull Map<String ,Integer> params, @PathVariable String id) {
        return goalService.changeState(Integer.valueOf(id),params.get("state"));
    }
}

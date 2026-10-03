package com.personalwork.controller;

import com.personalwork.domain.dto.ChecklistDto;
import com.personalwork.domain.query.ChecklistParam;
import com.personalwork.domain.query.ChecklistStateParam;
import com.personalwork.service.ChecklistService;
import com.personalwork.system.cache.DeleteCache;
import com.personalwork.system.cache.RedisKeyConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * <p>清单接口。</p>
 */
@RestController
@RequestMapping("/checklists")
@RequiredArgsConstructor
@Validated
public class ChecklistController {
    private final ChecklistService checklistService;

    /**
     * <p>获取当前用户的清单列表。</p>
     *
     * @return 清单列表
     */
    @GetMapping
    public List<ChecklistDto> list() {
        return checklistService.list();
    }

    /**
     * <p>新增清单。</p>
     *
     * @param param 清单参数
     * @return 新增清单编号
     */
    @PostMapping
    public Integer add(@RequestBody @Valid ChecklistParam param) {
        return checklistService.add(param);
    }

    /**
     * <p>修改清单。</p>
     *
     * @param id 清单编号
     * @param param 清单参数
     */
    @PutMapping("/{id}")
    @DeleteCache(value = {RedisKeyConstants.WEEK_LIST_KEY, RedisKeyConstants.MONTH_LIST_KEY}, isUserData = true)
    public void update(@PathVariable Integer id, @RequestBody @Valid ChecklistParam param) {
        checklistService.update(id, param);
    }

    /**
     * <p>修改清单完成状态。</p>
     *
     * @param id 清单编号
     * @param isDone 完成状态，0:未完成 1:已完成
     */
    @PutMapping("/{id}/state")
    public void updateState(@PathVariable Integer id, @RequestBody @Valid ChecklistStateParam param) {
        checklistService.updateState(id, param.getIsDone());
    }

    /**
     * <p>删除清单。</p>
     *
     * @param id 清单编号
     */
    @DeleteMapping("/{id}")
    @DeleteCache(value = {RedisKeyConstants.WEEK_LIST_KEY, RedisKeyConstants.MONTH_LIST_KEY}, isUserData = true)
    public void delete(@PathVariable Integer id) {
        checklistService.delete(id);
    }
}

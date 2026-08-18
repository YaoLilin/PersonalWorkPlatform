package com.personalwork.controller;

import com.personalwork.domain.query.ScheduleEventParam;
import com.personalwork.domain.vo.ScheduleEventVo;
import com.personalwork.service.ScheduleService;
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
 * 日程接口。<br>
 * <p>提供周统计项目时间记录的日程展示数据。</p>
 *
 * @author 姚礼林
 */
@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    /**
     * 获取当前用户的全部项目日程。
     *
     * @return 周统计表格中的项目时间记录
     */
    @GetMapping
    public List<ScheduleEventVo> getScheduleEvents() {
        return scheduleService.getScheduleEvents();
    }

    /**
     * 新增日程。
     *
     * @param param 日程信息
     * @return 已新增的日程
     */
    @PostMapping
    public ScheduleEventVo createSchedule(@RequestBody @Validated ScheduleEventParam param) {
        return scheduleService.createSchedule(param);
    }

    /**
     * 修改日程。
     *
     * @param id 日程编号
     * @param param 日程信息
     * @return 已更新的日程
     */
    @PutMapping("/{id}")
    public ScheduleEventVo updateSchedule(@PathVariable Integer id, @RequestBody @Validated ScheduleEventParam param) {
        return scheduleService.updateSchedule(id, param);
    }

    /**
     * 删除日程。
     *
     * @param id 日程编号
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public boolean deleteSchedule(@PathVariable Integer id) {
        return scheduleService.deleteSchedule(id);
    }
}

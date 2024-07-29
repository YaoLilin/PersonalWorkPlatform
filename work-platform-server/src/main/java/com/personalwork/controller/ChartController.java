package com.personalwork.controller;

import com.personalwork.enu.CountType;
import com.personalwork.modal.dto.MonthTimeCountDto;
import com.personalwork.modal.dto.ProjectTimeCountDto;
import com.personalwork.modal.dto.WeekTimeCountDto;
import com.personalwork.modal.entity.RecordMonthDo;
import com.personalwork.modal.query.TimeCountChartParam;
import com.personalwork.modal.vo.BarChartVo;
import com.personalwork.modal.vo.PipeCountVo;
import com.personalwork.service.ChartService;
import com.personalwork.util.NumberUtil;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 姚礼林
 * @desc 统计图接口
 * @date 2024/3/26
 */
@RestController
@RequestMapping("/chart")
public class ChartController {
    private final ChartService chartService;

    @Autowired
    public ChartController(ChartService chartService) {
        this.chartService = chartService;
    }

    @GetMapping("/type-time-count-month")
    public List<PipeCountVo> typeTimeCountOfMonth(@RequestParam Integer layer, @RequestParam @NotNull Integer monthId) {
        return chartService.typeTimeCountOfMonth(layer, monthId);
    }

    @GetMapping("/type-time-count-week")
    public List<PipeCountVo> typeTimeCountOfWeek(@RequestParam Integer layer, @RequestParam @NotNull Integer weekId) {
        return chartService.typeTimeCountOfWeek(layer,weekId);
    }

    @GetMapping("/week-time-count")
    public List<BarChartVo> weekTimeCount(@Validated TimeCountChartParam param) {
        List<WeekTimeCountDto> weekTimeCountDtoList = chartService.weekWorkTimeCount(param);
        List<BarChartVo> result = new ArrayList<>();
        for (WeekTimeCountDto weekTime : weekTimeCountDtoList) {
            String date = weekTime.week().getDate().substring(5);
            List<BarChartVo.Item> items = new ArrayList<>();
            List<ProjectTimeCountDto> countDtoItems = weekTime.items();
            countDtoItems.forEach(i ->{
                String name = param.getCountType() == CountType.PROJECT ? i.project().getName()
                        : i.project().getType().getName();
                items.add(new BarChartVo.Item(name,(double)i.minutes()));
            });
            result.add(new BarChartVo(date,items));
        }
        return result;
    }

    @GetMapping("/month-time-count")
    public List<BarChartVo> monthTimeCount(@Validated TimeCountChartParam param) {
        List<BarChartVo> result = new ArrayList<>();
        List<MonthTimeCountDto> timeCountList = chartService.monthWorkTimeCount(param);
        for (MonthTimeCountDto count : timeCountList) {
            RecordMonthDo month = count.month();
            String date = month.getYear() + "-" + month.getMonth();
            List<BarChartVo.Item> items = new ArrayList<>();
            count.items().forEach(i ->{
                String name = param.getCountType() == CountType.PROJECT ? i.project().getName()
                        : i.project().getType().getName();
                double hours = Double.parseDouble(NumberUtil.round((double) i.minutes() / 60, 1, false));
                items.add(new BarChartVo.Item(name,hours));
            });
            result.add(new BarChartVo(date,items));
        }
        return result;
    }
}

package com.personalwork.controller;

import com.personalwork.enu.CountType;
import com.personalwork.modal.dto.MonthTimeCountDto;
import com.personalwork.modal.dto.WeekTimeCountDto;
import com.personalwork.modal.entity.RecordMonthDo;
import com.personalwork.modal.query.TimeCountChartParam;
import com.personalwork.modal.vo.BarChartVo;
import com.personalwork.modal.vo.PipeCountVo;
import com.personalwork.service.ChartService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
        List<BarChartVo> result = new ArrayList<>();
        List<WeekTimeCountDto> weekTimeCountDtoList = chartService.weekWorkTimeCount(param);
        for (WeekTimeCountDto timeCount : weekTimeCountDtoList) {
            BarChartVo vo = new BarChartVo();
            vo.setXName(timeCount.getWeekDate().substring(5));
            if (param.getCountType() == CountType.PROJECT) {
                vo.setType(timeCount.getProjectName());
            }else {
                vo.setType(timeCount.getTypeName());
            }
            vo.setValue(timeCount.getMinutes());
            result.add(vo);
        }
        return result;
    }

    @GetMapping("/month-time-count")
    public List<BarChartVo> monthTimeCount(@Validated TimeCountChartParam param) {
        List<BarChartVo> result = new ArrayList<>();
        List<MonthTimeCountDto> timeCountList = chartService.monthWorkTimeCount(param);
        for (MonthTimeCountDto count : timeCountList) {
            BarChartVo vo = new BarChartVo();
            RecordMonthDo month = count.getMonth();
            vo.setXName(month.getYear()+"-"+month.getMonth());
            if (param.getCountType() == CountType.PROJECT) {
                vo.setType(count.getProject().getName());
            }else {
                vo.setType(count.getType().getName());
            }
            vo.setValue(count.getMinutes());
            result.add(vo);
        }
        return result;
    }
}

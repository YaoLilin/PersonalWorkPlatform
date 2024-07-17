package com.personalwork.controller;

import com.personalwork.enu.CountType;
import com.personalwork.modal.dto.WeekTimeCountDto;
import com.personalwork.modal.query.WeekTimeCountParam;
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
 * @desc TODO
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
    public List<BarChartVo> weekTimeCount(@Validated WeekTimeCountParam param) {
        List<BarChartVo> result = new ArrayList<>();
        List<WeekTimeCountDto> weekTimeCountDtoList = chartService.weekTimeCount(param);
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
}

package com.personalwork.controller;

import com.personalwork.modal.vo.PipeCountVo;
import com.personalwork.service.ChartService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @RequestMapping("/type-time-count-month")
    public List<PipeCountVo> typeTimeCountOfMonth(@RequestParam Integer layer, @RequestParam @NotNull Integer monthId) {
        return chartService.typeTimeCountOfMonth(layer, monthId);
    }

    @RequestMapping("/type-time-count-week")
    public List<PipeCountVo> typeTimeCountOfWeek(@RequestParam Integer layer, @RequestParam @NotNull Integer weekId) {
        return chartService.typeTimeCountOfWeek(layer,weekId);
    }
}

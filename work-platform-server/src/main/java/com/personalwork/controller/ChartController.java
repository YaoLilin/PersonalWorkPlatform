package com.personalwork.controller;

import com.personalwork.constants.CountType;
import com.personalwork.modal.dto.MonthTimeCountDto;
import com.personalwork.modal.dto.ProjectTimeCountDto;
import com.personalwork.modal.dto.WeekTimeCountDto;
import com.personalwork.modal.dto.WorkTimeProportionDto;
import com.personalwork.modal.entity.RecordMonthDo;
import com.personalwork.modal.query.TimeCountChartParam;
import com.personalwork.modal.vo.BarChartVo;
import com.personalwork.modal.vo.PieCountVo;
import com.personalwork.service.count.ChartService;
import com.personalwork.service.count.MonthWorkTimeCountService;
import com.personalwork.service.count.WeekWorkTimeCountService;
import com.personalwork.util.NumberUtil;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class ChartController {
    private final ChartService chartService;
    private final MonthWorkTimeCountService monthWorkTimeCountService;
    private final WeekWorkTimeCountService weekWorkTimeCountService;

    @GetMapping("/type-time-count-month")
    public List<PieCountVo> typeTimeCountOfMonth(@RequestParam Integer layer, @RequestParam @NotNull Integer monthId) {
        return monthWorkTimeCountService.typeTimeCountOfMonth(layer, monthId);
    }

    @GetMapping("/type-time-count-week")
    public List<PieCountVo> typeTimeCountOfWeek(@RequestParam Integer layer, @RequestParam @NotNull Integer weekId) {
        return weekWorkTimeCountService.typeTimeCountOfWeek(layer,weekId);
    }

    @GetMapping("/week-time-count")
    public List<BarChartVo> weekTimeCount(@Validated TimeCountChartParam param) {
        List<WeekTimeCountDto> weekTimeCountDtoList = weekWorkTimeCountService.weekWorkTimeCount(param);
        List<BarChartVo> result = new ArrayList<>();
        for (WeekTimeCountDto weekTime : weekTimeCountDtoList) {
            String date = weekTime.week().getDate().substring(5);
            List<ProjectTimeCountDto> projectTimeList = weekTime.items();
            List<BarChartVo.Item> typeData = getTypeData(param, projectTimeList);
            result.add(new BarChartVo(date,typeData));
        }
        return result;
    }

    @GetMapping("/month-time-count")
    public List<BarChartVo> monthTimeCount(@Validated TimeCountChartParam param) {
        List<BarChartVo> result = new ArrayList<>();
        List<MonthTimeCountDto> timeCountList = monthWorkTimeCountService.monthWorkTimeCount(param);
        for (MonthTimeCountDto count : timeCountList) {
            RecordMonthDo month = count.month();
            String date = month.getYear() + "-" + month.getMonth();
            List<BarChartVo.Item> items = getTypeData(param, count.items());
            result.add(new BarChartVo(date,items));
        }
        return result;
    }

    @GetMapping("/work-time-proportion")
    public List<PieCountVo> workTimeProportionCount(@Validated TimeCountChartParam param) {
        List<WorkTimeProportionDto> proportionDtoList = chartService.workTimeProportionCount(param);
        List<PieCountVo> result = new ArrayList<>();
        for (WorkTimeProportionDto proportionDto : proportionDtoList) {
            PieCountVo pieCountVo = new PieCountVo();
            if (param.getCountType() == CountType.PROJECT) {
                pieCountVo.setName(proportionDto.getProject().getName());
            }else {
                pieCountVo.setName(proportionDto.getType().getName());
            }
            pieCountVo.setCount(proportionDto.getMinutes());
            result.add(pieCountVo);
        }
        return result;
    }

    /**
     * 获取统计图中的类别数据，例如这一周中a项目的时间、b项目的时间
     */
    private List<BarChartVo.Item> getTypeData(TimeCountChartParam param, List<ProjectTimeCountDto> countDtoItems) {
        List<BarChartVo.Item> items = new ArrayList<>();
        countDtoItems.forEach(i ->{
            String name = param.getCountType() == CountType.PROJECT ? i.project().getName()
                    : i.project().getType().getName();
            double hour = NumberUtil.round((double) i.minutes()/60, 1, false);
            items.add(new BarChartVo.Item(name,hour));
        });
        return items;
    }
}

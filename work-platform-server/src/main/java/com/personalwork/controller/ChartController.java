package com.personalwork.controller;

import com.personalwork.constants.CountType;
import com.personalwork.domain.dto.MonthTimeCountDto;
import com.personalwork.domain.dto.ProjectTimeCountDto;
import com.personalwork.domain.dto.WeekTimeCountDto;
import com.personalwork.domain.dto.WorkTimeProportionDto;
import com.personalwork.domain.entity.RecordMonthDo;
import com.personalwork.domain.entity.TypeDo;
import com.personalwork.domain.query.TimeCountChartParam;
import com.personalwork.domain.vo.BarChartVo;
import com.personalwork.domain.vo.PieCountVo;
import com.personalwork.service.count.ChartService;
import com.personalwork.service.count.MonthWorkTimeCountService;
import com.personalwork.service.count.TaskChartService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final TaskChartService taskChartService;

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
        if (param.getCountType() == CountType.PROJECT) {
            return taskChartService.weekTimeCount(param);
        }
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
        if (param.getCountType() == CountType.PROJECT) {
            return taskChartService.monthTimeCount(param);
        }
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
        if (param.getCountType() == CountType.PROJECT) {
            return taskChartService.workTimeProportionCount(param);
        }
        List<WorkTimeProportionDto> proportionDtoList = chartService.workTimeProportionCount(param);
        List<PieCountVo> result = new ArrayList<>();
        for (WorkTimeProportionDto proportionDto : proportionDtoList) {
            PieCountVo pieCountVo = new PieCountVo();
            if (param.getCountType() == CountType.PROJECT) {
                pieCountVo.setName(proportionDto.getProject().getName());
            }else {
                pieCountVo.setName(proportionDto.getType().getName());
            }
            pieCountVo.setCount(getHour(proportionDto.getMinutes()));
            result.add(pieCountVo);
        }
        return result;
    }

    /**
     * 获取统计图中的类别数据，例如这一周中a项目的时间、b项目的时间
     */
    private List<BarChartVo.Item> getTypeData(TimeCountChartParam param, List<ProjectTimeCountDto> countDtoItems) {
        if (param.getCountType() == CountType.PROJECT) {
            List<BarChartVo.Item> items = new ArrayList<>();
            countDtoItems.forEach(i ->{
                String name = param.getCountType() == CountType.PROJECT ? i.project().getName()
                        : i.project().getType().getName();
                double hour = getHour(i.minutes());
                items.add(new BarChartVo.Item(name,hour));
            });
            return items;
        }
        return getTypeDataByProjectType(countDtoItems);
    }

    private static List<BarChartVo.Item> getTypeDataByProjectType(List<ProjectTimeCountDto> countDtoItems) {
        List<BarChartVo.Item> items = new ArrayList<>();
        Map<TypeDo, Integer> typeTimeMap = new HashMap<>(20);
        // 统计每个项目类型的时间，如果是同一个类型，则累加时间
        countDtoItems.forEach(i -> {
            int minutes = i.minutes();
            typeTimeMap.put(i.project().getType(),
                    typeTimeMap.getOrDefault(i.project().getType(), 0) + minutes);
        });
        typeTimeMap.forEach((type, minutes) -> {
            items.add(new BarChartVo.Item(type.getName(), getHour(minutes)));
        });
        return items;
    }

    private static double getHour(int minutes) {
        return NumberUtil.round((double) minutes/60, 1, false);
    }
}

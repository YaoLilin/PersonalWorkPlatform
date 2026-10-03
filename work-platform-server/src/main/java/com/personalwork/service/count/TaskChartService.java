package com.personalwork.service.count;

import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.domain.dto.MonthRecordDto;
import com.personalwork.domain.dto.TaskTimeDto;
import com.personalwork.domain.dto.WeekTimeCountDto;
import com.personalwork.domain.entity.RecordWeekDo;
import com.personalwork.domain.query.TimeCountChartParam;
import com.personalwork.domain.vo.BarChartVo;
import com.personalwork.domain.vo.PieCountVo;
import com.personalwork.domain.vo.ScheduleEventVo;
import com.personalwork.service.TaskTimeCountService;
import com.personalwork.service.count.manage.MonthRecordManager;
import com.personalwork.util.NumberUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * <p>统计图中的项目与清单时间。关联项目的清单计入项目，独立清单按编号统计。</p>
 */
@Service
@RequiredArgsConstructor
public class TaskChartService {
    private final TaskTimeCountService taskTimeCountService;
    private final WeekWorkTimeCountService weekWorkTimeCountService;
    private final MonthRecordManager monthRecordManager;
    private final RecordWeekMapper recordWeekMapper;
    private final Clock clock;

    /**
     * <p>按周返回项目和清单的堆叠柱状图数据。</p>
     *
     * @param param 日期范围及项目筛选条件
     * @return 每周的统计结果
     */
    public List<BarChartVo> weekTimeCount(TimeCountChartParam param) {
        List<ScheduleEventVo> events = taskTimeCountService.listEvents();
        TimeCountChartParam rangeParam = new TimeCountChartParam();
        BeanUtils.copyProperties(param, rangeParam);
        rangeParam.setProjects(List.of());
        Map<LocalDate, RecordWeekDo> weeks = new TreeMap<>();
        for (WeekTimeCountDto week : weekWorkTimeCountService.weekWorkTimeCount(rangeParam)) {
            weeks.put(LocalDate.parse(week.week().getDate()), week.week());
        }
        LocalDate rangeStart = LocalDate.parse(rangeParam.getStartDate());
        LocalDate rangeEnd = LocalDate.parse(rangeParam.getEndDate());
        LocalDate currentWeek = LocalDate.now(clock).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        for (RecordWeekDo week : recordWeekMapper.getWorkWeekList(rangeParam.getUserId())) {
            LocalDate weekStart = LocalDate.parse(week.getDate());
            boolean withinSelectedRange = !weekStart.isBefore(rangeStart) && !weekStart.isAfter(rangeEnd);
            boolean excludeCurrentWeek = rangeEnd.equals(currentWeek) && weekStart.equals(currentWeek);
            boolean shouldIncludeWeek = withinSelectedRange && !excludeCurrentWeek;
            if (shouldIncludeWeek) {
                weeks.putIfAbsent(weekStart, week);
            }
        }
        List<BarChartVo> result = new ArrayList<>(weeks.size());
        for (Map.Entry<LocalDate, RecordWeekDo> week : weeks.entrySet()) {
            LocalDate start = week.getKey();
            List<BarChartVo.Item> items = filter(
                    taskTimeCountService.countForChart(events, start, start.plusWeeks(1)), param)
                    .stream().map(this::toBarItem).toList();
            result.add(new BarChartVo(week.getValue().getDate().substring(5), items));
        }
        return result;
    }

    /**
     * <p>按月返回项目和清单的堆叠柱状图数据。</p>
     *
     * @param param 月份范围及项目筛选条件
     * @return 每月的统计结果
     */
    public List<BarChartVo> monthTimeCount(TimeCountChartParam param) {
        List<MonthRecordDto> months = monthRecordManager.getMonthRecordList(param);
        List<BarChartVo> result = new ArrayList<>(months.size());
        for (MonthRecordDto month : months) {
            String date = month.getRecordMonthDo().getYear() + "-" + month.getRecordMonthDo().getMonth();
            List<BarChartVo.Item> items = filter(month.getTaskTimeList(), param).stream()
                    .map(this::toBarItem).toList();
            result.add(new BarChartVo(date, items));
        }
        result.sort((first, second) -> {
            String[] firstDate = first.date().split("-");
            String[] secondDate = second.date().split("-");
            int yearOrder = Integer.compare(Integer.parseInt(firstDate[0]), Integer.parseInt(secondDate[0]));
            return yearOrder != 0 ? yearOrder
                    : Integer.compare(Integer.parseInt(firstDate[1]), Integer.parseInt(secondDate[1]));
        });
        return result;
    }

    /**
     * <p>汇总所选月份的项目与清单时间占比。</p>
     *
     * @param param 月份范围及项目筛选条件
     * @return 饼图统计结果
     */
    public List<PieCountVo> workTimeProportionCount(TimeCountChartParam param) {
        // key: 项目或清单类型加编号；value: 所选月份内该项目或清单的累计时间。
        Map<String, TaskTimeDto> counts = new LinkedHashMap<>(10);
        for (MonthRecordDto month : monthRecordManager.getMonthRecordList(param)) {
            for (TaskTimeDto task : filter(month.getTaskTimeList(), param)) {
                String key = taskKey(task);
                counts.merge(key, task, (current, added) -> new TaskTimeDto(
                        current.id(), current.name(), current.minutes() + added.minutes(), current.isChecklist()));
            }
        }
        return counts.values().stream().map(this::toPieItem).toList();
    }

    private List<TaskTimeDto> filter(List<TaskTimeDto> tasks,
                                                        TimeCountChartParam param) {
        if (tasks == null) {
            return List.of();
        }
        List<Integer> projects = param.getProjects();
        if (projects == null || projects.isEmpty()) {
            return tasks;
        }
        return tasks.stream().filter(task -> task.isChecklist() || projects.contains(task.id())).toList();
    }

    private BarChartVo.Item toBarItem(TaskTimeDto task) {
        return new BarChartVo.Item(task.name(), getHour(task.minutes()), taskKey(task), task.isChecklist());
    }

    private PieCountVo toPieItem(TaskTimeDto task) {
        PieCountVo item = new PieCountVo();
        item.setName(task.name());
        item.setKey(taskKey(task));
        item.setChecklist(task.isChecklist());
        item.setCount(getHour(task.minutes()));
        return item;
    }

    private String taskKey(TaskTimeDto task) {
        return (task.isChecklist() ? "checklist:" : "project:") + task.id();
    }

    private double getHour(int minutes) {
        return NumberUtil.round((double) minutes / 60, 1, false);
    }
}

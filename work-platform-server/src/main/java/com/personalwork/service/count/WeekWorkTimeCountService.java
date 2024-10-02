package com.personalwork.service.count;

import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.dao.WorkTimeCountMapper;
import com.personalwork.constants.TimeRange;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.modal.dto.ProjectTimeCountDto;
import com.personalwork.modal.dto.ProjectWeekTimeDto;
import com.personalwork.modal.dto.WeekTimeCountDto;
import com.personalwork.modal.entity.RecordWeekDo;
import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import com.personalwork.modal.query.TimeCountChartParam;
import com.personalwork.modal.vo.PieCountVo;
import com.personalwork.service.count.bean.ProjectTime;
import com.personalwork.service.count.manage.ProjectTypeCountManager;
import com.personalwork.util.DateUtil;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

/**
 * @author yaolilin
 * @desc 周工作时间统计
 * @date 2024/8/26
 **/
@Service
@RequiredArgsConstructor
public class WeekWorkTimeCountService {
    private final WorkTimeCountMapper workTimeCountMapper;
    private final WeekProjectTimeCountMapper weekProjectTimeCountMapper;
    private final ProjectTypeCountManager projectTypeCountManager;

    /**
     * 统计每个项目（或类型）每周的工作时间
     * @param param 条件参数
     * @return 统计结果集合
     */
    public List<WeekTimeCountDto> weekWorkTimeCount(TimeCountChartParam param) {
        param.setUserId(UserUtil.getLoginUserId());
        String[] dateRange = getDateRange(param);
        String startDate = dateRange[0];
        String endDate = dateRange[1];
        List<ProjectWeekTimeDto> projectWeekTimeList = getProjectWeekTimeList(param,startDate,endDate);
        List<WeekTimeCountDto> result = getProjectTimeOfEachWeek(projectWeekTimeList);
        fillEmptyWeekTime(result,startDate,endDate);
        return result;
    }

    /**
     * 统计本周的各项目类型的时间
     *
     * @param layer  类型层次，1为项目类型所在的层，如果为2，则为项目类型的上一层，以此类推
     * @param weekId 周id
     * @return 各项目类型的时间，包含占比
     */
    public List<PieCountVo> typeTimeCountOfWeek(Integer layer, Integer weekId) {
        List<WeekProjectTimeCountDo> projectCountList = weekProjectTimeCountMapper.listByWeekId(weekId);
        if (projectCountList.isEmpty()) {
            return new ArrayList<>();
        }
        List<ProjectTime> projectTimeList = new ArrayList<>();
        projectCountList.forEach(i -> {
            ProjectTime projectTime = new ProjectTime();
            projectTime.setMinutes(i.getMinutes());
            projectTime.setProjectId(i.getProject());
            projectTimeList.add(projectTime);
        });
        return projectTypeCountManager.countProjectTypeTime(projectTimeList);
    }

    private List<WeekTimeCountDto> getProjectTimeOfEachWeek(List<ProjectWeekTimeDto> projectWeekTimeList) {
        Map<RecordWeekDo, WeekTimeCountDto> weekTimeMap = new LinkedHashMap<>(10);
        for (ProjectWeekTimeDto projectTime : projectWeekTimeList) {
            ProjectTimeCountDto item = new ProjectTimeCountDto(projectTime.project(), projectTime.minutes());
            weekTimeMap.computeIfAbsent(projectTime.week(),
                    k -> new WeekTimeCountDto(projectTime.week(), new ArrayList<>())).items().add(item);
        }
        return new ArrayList<>(weekTimeMap.values());
    }

    private String[] getDateRange(TimeCountChartParam param) {
        String startDate;
        String endDate;
        if (param.getTimeRange() == TimeRange.CUSTOM){
            if (param.getStartDate() == null || param.getEndDate() == null) {
                throw new IllegalArgumentException("开始日期或结束如期为空");
            }
            startDate = param.getStartDate();
            endDate = param.getEndDate();
        }else{
            String[] dateRange = getDateRangeByType(param.getTimeRange());
            startDate = dateRange[0];
            endDate = dateRange[1];
        }
        return new String[]{startDate, endDate};
    }

    private String[] getDateRangeByType(TimeRange timeRange) {
        String[] dateRange;
        switch (timeRange) {
            case NEALY_FOUR_WEEK -> dateRange = DateUtil.getDateRangeByWeekBaseMonday( 4);
            case NEALY_TWELVE_WEEK -> dateRange = DateUtil.getDateRangeByWeekBaseMonday(12);
            case NEALY_HALF_YEAR -> dateRange = DateUtil.getDateRangeByWeekBaseMonday( 26);
            case NEALY_SIX_MONTH -> dateRange = DateUtil.getDateRangeByMonth(6);
            case NEALY_TWELVE_MONTH -> dateRange = DateUtil.getDateRangeByMonth(12);
            default -> throw new MethodParamInvalidException("找不到 TimeRange 枚举");
        }
        return dateRange;
    }

    private List<ProjectWeekTimeDto> getProjectWeekTimeList(TimeCountChartParam param,String startDate,String endDate) {
        param.setStartDate(startDate);
        param.setEndDate(endDate);
        return workTimeCountMapper.listByDateRange(param);
    }

    /**
     * 对于没有记录在数据库的周数据，填充为工作时间为0的周数据
     */
    private void fillEmptyWeekTime(List<WeekTimeCountDto> weekTimeCountList,String startDate,String endDate) {
        DateTimeFormatter formatter =  DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate weekDate = getEndDate(endDate, formatter);
        LocalDate startWeekDate = LocalDate.parse(startDate,formatter);
        while (weekDate.isAfter(startWeekDate)) {
            LocalDate finalWeekDate = weekDate;
            Optional<WeekTimeCountDto> weekTimeCountOp = weekTimeCountList.stream()
                    .filter(i -> LocalDate.parse(i.week().getDate(), formatter).equals(finalWeekDate))
                    .findAny();
            if (weekTimeCountOp.isEmpty()) {
                RecordWeekDo weekDo = new RecordWeekDo();
                weekDo.setTime(0);
                weekDo.setDate(formatter.format(weekDate));
                weekTimeCountList.add(new WeekTimeCountDto(weekDo,new ArrayList<>()));
            }
            // weekDate 往前一周
            weekDate = weekDate.minusWeeks(1);
        }
        weekTimeCountList.sort((w1,w2) -> {
            LocalDate w1Date = LocalDate.parse(w1.week().getDate(), formatter);
            LocalDate w2Date = LocalDate.parse(w2.week().getDate(), formatter);
            return w1Date.compareTo(w2Date);
        });
    }

    private LocalDate getEndDate(String endDate, DateTimeFormatter formatter) {
        LocalDate weekDate = LocalDate.parse(endDate, formatter);
        LocalDate currentWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        // 不统计本周的数据，还未生成
        if (weekDate.isEqual(currentWeek)) {
            // weekDate设为上周的周一
            weekDate = weekDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusDays(7);
        }
        return weekDate;
    }
}

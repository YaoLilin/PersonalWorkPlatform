package com.personalwork.service;

import com.personalwork.dao.*;
import com.personalwork.exception.ChartCalculateException;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.modal.dto.WeekTimeCountDto;
import com.personalwork.modal.entity.MonthProjectCountDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import com.personalwork.modal.query.WeekTimeCountParam;
import com.personalwork.modal.vo.PipeCountVo;
import com.personalwork.util.DateUtil;
import com.personalwork.util.NumberUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author 姚礼林
 * @desc 统计图数据业务类
 * @date 2024/3/26
 */
@Service
public class ChartService {
    private final MonthProjectCountMapper monthProjectCountMapper;
    private final ProjectMapper projectMapper;
    private final TypeMapper typeMapper;
    private final WeekProjectTimeCountMapper weekProjectTimeCountMapper;
    private final WeekTimeCountMapper weekTimeCountMapper;

    @Autowired
    public ChartService(MonthProjectCountMapper monthProjectCountMapper, ProjectMapper projectMapper,
                        TypeMapper typeMapper, WeekProjectTimeCountMapper weekProjectTimeCountMapper,
                        WeekTimeCountMapper weekTimeCountMapper) {
        this.monthProjectCountMapper = monthProjectCountMapper;
        this.projectMapper = projectMapper;
        this.typeMapper = typeMapper;
        this.weekProjectTimeCountMapper = weekProjectTimeCountMapper;
        this.weekTimeCountMapper = weekTimeCountMapper;
    }

    /**
     * 通用类，在统计月份和周的项目类型时间占用时将项目时间实体类转换成此类，方便进行统计
     */
    private static class ProjectTime {
        private Integer minutes;
        private Integer projectId;
    }

    /**
     * 统计此月的各项目类型的时间
     *
     * @param layer   类型层次，1为项目类型所在的层，如果为2，则为项目类型的上一层，以此类推
     * @param monthId 月份id
     * @return 各项目类型的时间，包含占比
     */
    public List<PipeCountVo> typeTimeCountOfMonth(Integer layer, Integer monthId) {
        List<MonthProjectCountDo> projectCountList = monthProjectCountMapper.list(monthId);
        if (projectCountList.isEmpty()) {
            return new ArrayList<>();
        }
        List<ProjectTime> projectTimeList = new ArrayList<>();
        projectCountList.forEach(i -> {
            if (i.getMinute() == null || i.getMinute() == 0) {
                throw new ChartCalculateException.TypeChartCalculateException("项目时间不允许为空或0，MonthProjectCountDo："
                        + i);
            }
            if (i.getProjectId() == null) {
                throw new ChartCalculateException.TypeChartCalculateException("项目id不允许为空，MonthProjectCountDo：" + i);
            }
            ProjectTime projectTime = new ProjectTime();
            projectTime.minutes = i.getMinute();
            projectTime.projectId = i.getProjectId();
            projectTimeList.add(projectTime);
        });

        return countProjectTypeTime(projectTimeList);
    }

    public List<WeekTimeCountDto> weekTimeCount(WeekTimeCountParam param) {
        String[] dateRange = getDateRange(param);
        String startDate = dateRange[0];
        String endDate = dateRange[1];
        param.setStartDate(startDate);
        param.setEndDate(endDate);
        return weekTimeCountMapper.listByDateRange(param);
    }

    private String[] getDateRange(WeekTimeCountParam param) {
        String startDate;
        String endDate;
        String[] dateRange;
        switch (param.getTimeRange()) {
            case NEALY_FOUR_WEEK -> {
                dateRange = DateUtil.getDateRangeByWeekBaseMonday(DateUtil.getNowDate(), 4);
                startDate = dateRange[0];
                endDate = dateRange[1];
            }
            case NEALY_TWELVE_WEEK -> {
                dateRange = DateUtil.getDateRangeByWeekBaseMonday(DateUtil.getNowDate(), 12);
                startDate = dateRange[0];
                endDate = dateRange[1];
            }
            case NEALY_HALF_YEAR -> {
                dateRange = DateUtil.getDateRangeByWeekBaseMonday(DateUtil.getNowDate(), 26);
                startDate = dateRange[0];
                endDate = dateRange[1];
            }
            case CUSTOM -> {
                startDate = param.getStartDate();
                endDate = param.getEndDate();
            }
            default -> throw new MethodParamInvalidException("找不到 TimeRange 枚举");
        }
        return new String[]{startDate, endDate};
    }

    /**
     * 统计本周的各项目类型的时间
     *
     * @param layer  类型层次，1为项目类型所在的层，如果为2，则为项目类型的上一层，以此类推
     * @param weekId 周id
     * @return 各项目类型的时间，包含占比
     */
    public List<PipeCountVo> typeTimeCountOfWeek(Integer layer, Integer weekId) {
        List<WeekProjectTimeCountDo> projectCountList = weekProjectTimeCountMapper.listByWeekId(weekId);
        if (projectCountList.isEmpty()) {
            return new ArrayList<>();
        }
        List<ProjectTime> projectTimeList = new ArrayList<>();
        projectCountList.forEach(i -> {
            ProjectTime projectTime = new ProjectTime();
            projectTime.minutes = i.getMinutes();
            projectTime.projectId = i.getProject();
            projectTimeList.add(projectTime);
        });
        return countProjectTypeTime(projectTimeList);
    }

    /**
     * 统计各项目类型所占用的时间
     *
     * @param projectTimeList 所有项目时间记录，从数据库中获取
     * @return 统计的各项目类型所占用的时间，包含占比
     */
    private List<PipeCountVo> countProjectTypeTime(List<ProjectTime> projectTimeList) {
        List<PipeCountVo> result = new ArrayList<>();
        int sumTime = projectTimeList.stream().mapToInt(i -> i.minutes).sum();
        if (sumTime == 0) {
            throw new ChartCalculateException.TypeChartCalculateException("所有类型总时间不能为0");
        }
        Map<TypeDo, Integer> typeAndTimeMap = calculateEachTypeTime(projectTimeList);
        typeAndTimeMap.forEach((type, time) -> {
            PipeCountVo countVo = buildPipeCountVo(sumTime, type, time);
            result.add(countVo);
        });
        return result;
    }

    private Map<TypeDo, Integer> calculateEachTypeTime(List<ProjectTime> projectTimeList) {
        Map<Integer, TypeDo> projectIdAndTypeMap = getProjectIdTypeMap(projectTimeList);
        Map<TypeDo, Integer> typeAndTimeMap = new HashMap<>(10);
        for (ProjectTime projectTime : projectTimeList) {
            TypeDo type = projectIdAndTypeMap.computeIfAbsent(projectTime.projectId, id -> getTypeByProjectTime(projectTime));
            Integer minutes = projectTime.minutes;
            if (minutes != null) {
                typeAndTimeMap.put(type, typeAndTimeMap.getOrDefault(type, 0) + minutes);
            }
        }
        return typeAndTimeMap;
    }

    private PipeCountVo buildPipeCountVo(int totalMinutes, TypeDo type, Integer time) {
        PipeCountVo countVo = new PipeCountVo();
        String typeName = type.getName();
        double percent;
        try {
            percent = Double.parseDouble(NumberUtil.round((double) time / totalMinutes * 100,
                    0, true));
        } catch (NumberFormatException e) {
            throw new ChartCalculateException.TypeChartCalculateException("计算当前类型的时间占比出错，当前类型占用时间："
                    + time + "，总时间：" + totalMinutes + "，类型：" + type, e);
        }
        countVo.setName(typeName);
        countVo.setCount(time);
        countVo.setPercent(percent);
        return countVo;
    }

    private Map<Integer, TypeDo> getProjectIdTypeMap(List<ProjectTime> projectTimeList) {
        Map<Integer, TypeDo> projectIdTypeMap = new HashMap<>(10);
        for (ProjectTime projectTime : projectTimeList) {
            TypeDo type = getTypeByProjectTime(projectTime);
            projectIdTypeMap.computeIfAbsent(projectTime.projectId, id -> type);
        }
        return projectIdTypeMap;
    }

    private TypeDo getTypeByProjectTime(ProjectTime projectTime) {
        Integer projectId = projectTime.projectId;
        ProjectDo projectDo = projectMapper.getProject(projectId);
        return projectDo.getType();
    }


}

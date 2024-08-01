package com.personalwork.service;

import com.personalwork.dao.*;
import com.personalwork.enu.CountType;
import com.personalwork.enu.TimeRange;
import com.personalwork.exception.ChartCalculateException;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.modal.dto.*;
import com.personalwork.modal.entity.*;
import com.personalwork.modal.query.TimeCountChartParam;
import com.personalwork.modal.vo.PieCountVo;
import com.personalwork.util.DateUtil;
import com.personalwork.util.NumberUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

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
    private final WorkTimeCountMapper workTimeCountMapper;
    private final MonthRecordService monthRecordService;

    @Autowired
    public ChartService(MonthProjectCountMapper monthProjectCountMapper, ProjectMapper projectMapper,
                        TypeMapper typeMapper, WeekProjectTimeCountMapper weekProjectTimeCountMapper,
                        WorkTimeCountMapper workTimeCountMapper, MonthRecordService monthRecordService) {
        this.monthProjectCountMapper = monthProjectCountMapper;
        this.projectMapper = projectMapper;
        this.typeMapper = typeMapper;
        this.weekProjectTimeCountMapper = weekProjectTimeCountMapper;
        this.workTimeCountMapper = workTimeCountMapper;
        this.monthRecordService = monthRecordService;
    }

    /**
     * 统计此月的各项目类型的时间
     *
     * @param layer   类型层次，1为项目类型所在的层，如果为2，则为项目类型的上一层，以此类推
     * @param monthId 月份id
     * @return 各项目类型的时间，包含占比
     */
    public List<PieCountVo> typeTimeCountOfMonth(Integer layer, Integer monthId) {
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
            projectTime.minutes = i.getMinutes();
            projectTime.projectId = i.getProject();
            projectTimeList.add(projectTime);
        });
        return countProjectTypeTime(projectTimeList);
    }

    /**
     * 统计每个项目（或类型）每周的工作时间
     * @param param 条件参数
     * @return 统计结果集合
     */
    public List<WeekTimeCountDto> weekWorkTimeCount(TimeCountChartParam param) {
        String[] dateRange = getDateRange(param);
        String startDate = dateRange[0];
        String endDate = dateRange[1];
        List<ProjectWeekTimeDto> projectWeekTimeList = getProjectWeekTimeList(param,startDate,endDate);
        Map<RecordWeekDo, WeekTimeCountDto> weekTimeMap = new LinkedHashMap<>(10);
        for (ProjectWeekTimeDto projectTime : projectWeekTimeList) {
            ProjectTimeCountDto item = new ProjectTimeCountDto(projectTime.project(), projectTime.minutes());
            weekTimeMap.computeIfAbsent(projectTime.week(),
                    k -> new WeekTimeCountDto(projectTime.week(), new ArrayList<>())).items().add(item);
        }
        List<WeekTimeCountDto> result = new ArrayList<>(weekTimeMap.values());
        fillEmptyWeekTime(result,startDate,endDate);
        return result;
    }

    /**
     * 统计每个项目（或类型）每月的工作时间
     * @param param 条件参数
     * @return 统计结果集合
     */
    public List<MonthTimeCountDto> monthWorkTimeCount(TimeCountChartParam param) {
        List<MonthRecordDto> monthRecordList = getMonthRecordList(param);
        monthRecordList.sort((i,i2) -> {
            if (Objects.equals(i.getRecordMonthDo().getYear(), i2.getRecordMonthDo().getYear())) {
                return i.getRecordMonthDo().getMonth() - i2.getRecordMonthDo().getMonth();
            }
            return i.getRecordMonthDo().getYear() - i2.getRecordMonthDo().getYear();
        });
        List<MonthTimeCountDto> result = new ArrayList<>();
        for (MonthRecordDto month : monthRecordList) {
            List<MonthProjectCountDto> projectCountList = month.getProjectCountList();
            result.add(buildMonthTimeCountDto(param, month, projectCountList));
        }
        return result;
    }

    /**
     * 按月统计每个项目或类型的工作时间占比
     * @param param 条件参数
     * @return 工作时间占比，集合每个元素对应一个项目或类型的工作时间占比信息
     */
    public List<WorkTimeProportionDto> workTimeProportionCount(TimeCountChartParam param) {
        Map<Integer, ProjectDo> projectDoMap = new HashMap<>();
        List<MonthRecordDto> monthRecordList = getMonthRecordList(param);
        Map<Integer, WorkTimeProportionDto> workTimeMap = new LinkedHashMap<>(10);
        for (MonthRecordDto month : monthRecordList) {
            for (MonthProjectCountDto projectCount : month.getProjectCountList()) {
                ProjectDo projectDo = projectDoMap.computeIfAbsent(projectCount.getProjectId(),
                        k -> projectMapper.getProject(projectCount.getProjectId()));
                WorkTimeProportionDto workTime;
                if (param.getCountType() == CountType.PROJECT) {
                    if (!inParamProjects(param, projectDo)) {
                        continue;
                    }
                    workTime = workTimeMap.computeIfAbsent(projectCount.getProjectId(),
                            k -> new WorkTimeProportionDto(projectDo, null, projectCount.getMinute()));
                }else {
                    if (!inParamTypes(param, projectDo)) {
                        continue;
                    }
                    workTime = workTimeMap.computeIfAbsent(projectDo.getType().getId(),
                            k -> new WorkTimeProportionDto(null, projectDo.getType(), projectCount.getMinute()));
                }
                workTime.setMinutes(workTime.getMinutes() + projectCount.getMinute());
            }
        }
        return new ArrayList<>(workTimeMap.values());
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
        LocalDate weekDate = LocalDate.parse(endDate, formatter);
        LocalDate startWeekDate = LocalDate.parse(startDate,formatter);
        while (weekDate.isAfter(startWeekDate)) {
            int previousWeekIndex = 0;
            boolean isFind = false;
            for (int i = weekTimeCountList.size() - 1; i >= 0; i--) {
                LocalDate currentWeekDate = LocalDate.parse(weekTimeCountList.get(i).week().getDate(), formatter);
                if (currentWeekDate.isEqual(weekDate)) {
                    isFind= true;
                    break;
                }
                if (currentWeekDate.isBefore(weekDate)) {
                    previousWeekIndex = i;
                    break;
                }
            }
            if (!isFind) {
                RecordWeekDo weekDo = new RecordWeekDo();
                weekDo.setTime(0);
                weekDo.setDate(formatter.format(weekDate));
                weekTimeCountList.add(previousWeekIndex,new WeekTimeCountDto(weekDo,new ArrayList<>()));
            }
            weekDate = weekDate.minusWeeks(1);
        }
    }

    private MonthTimeCountDto buildMonthTimeCountDto(TimeCountChartParam param, MonthRecordDto month,
                                                     List<MonthProjectCountDto> projectCountList) {
        List<ProjectTimeCountDto> items = new ArrayList<>();
        for (MonthProjectCountDto projectCount : projectCountList) {
            ProjectDo projectDo = projectMapper.getProject(projectCount.getProjectId());
            if (param.getCountType() == CountType.PROJECT && !inParamProjects(param, projectDo)) {
                continue;
            }
            if (param.getCountType() == CountType.TYPE && !inParamTypes(param, projectDo)) {
                continue;
            }
            ProjectTimeCountDto item = new ProjectTimeCountDto(projectDo, projectCount.getMinute());
            items.add(item);
        }
        return new MonthTimeCountDto(month.getRecordMonthDo(),items);
    }

    private  boolean inParamTypes(TimeCountChartParam param, ProjectDo projectDo) {
        if (param.getTypes() != null && !param.getTypes().isEmpty()) {
            return param.getTypes().contains(projectDo.getType().getId());
        }
        return true;
    }

    private boolean inParamProjects(TimeCountChartParam param, ProjectDo projectDo) {
        if (param.getProjects() != null && !param.getProjects().isEmpty()) {
            return param.getProjects().contains(projectDo.getId());
        }
        return true;
    }

    private List<MonthRecordDto> getMonthRecordList(TimeCountChartParam param) {
        LocalDate now = LocalDate.now();
        int startYear;
        int startMonth;
        Integer endYear= null;
        Integer endMonth= null;
        if (param.getTimeRange() == TimeRange.CUSTOM) {
            if (param.getStartDate() == null || param.getEndDate() == null) {
                throw new MethodParamInvalidException("开始日期或结束如期为空");
            }
            String[] startDateSplit = param.getStartDate().split("-");
            startYear = Integer.parseInt(startDateSplit[0]);
            startMonth = Integer.parseInt(startDateSplit[1]);
            String[] endDateSplit = param.getEndDate().split("-");
            endYear = Integer.parseInt(endDateSplit[0]);
            endMonth = Integer.parseInt(endDateSplit[1]);
        }else {
            LocalDate date;
            switch (param.getTimeRange()) {
                case NEALY_SIX_MONTH -> date = now.minusMonths(6);
                case NEALY_TWELVE_MONTH -> date = now.minusMonths(12);
                default -> throw new MethodParamInvalidException("日期范围类型不在范围内");
            }
            startYear = date.getYear();
            startMonth = date.getMonthValue();
        }
        return monthRecordService.getWorkMonthRecordList(startYear, startMonth,endYear,endMonth);
    }

    private String[] getDateRange(TimeCountChartParam param) {
        String startDate;
        String endDate;
        if (param.getTimeRange() != TimeRange.CUSTOM){
            String[] dateRange;
            switch (param.getTimeRange()) {
                case NEALY_FOUR_WEEK -> dateRange = DateUtil.getDateRangeByWeekBaseMonday( 4);
                case NEALY_TWELVE_WEEK -> dateRange = DateUtil.getDateRangeByWeekBaseMonday(12);
                case NEALY_HALF_YEAR -> dateRange = DateUtil.getDateRangeByWeekBaseMonday( 26);
                case NEALY_SIX_MONTH -> dateRange = DateUtil.getDateRangeByMonth(6);
                case NEALY_TWELVE_MONTH -> dateRange = DateUtil.getDateRangeByMonth(12);
                default -> throw new MethodParamInvalidException("找不到 TimeRange 枚举");
            }
            startDate = dateRange[0];
            endDate = dateRange[1];
        }else{
            if (param.getStartDate() == null || param.getEndDate() == null) {
                throw new MethodParamInvalidException("开始日期或结束如期为空");
            }
            startDate = param.getStartDate();
            endDate = param.getEndDate();
        }
        return new String[]{startDate, endDate};
    }

    /**
     * 统计各项目类型所占用的时间
     *
     * @param projectTimeList 所有项目时间记录，从数据库中获取
     * @return 统计的各项目类型所占用的时间，包含占比
     */
    private List<PieCountVo> countProjectTypeTime(List<ProjectTime> projectTimeList) {
        List<PieCountVo> result = new ArrayList<>();
        int sumTime = projectTimeList.stream().mapToInt(i -> i.minutes).sum();
        if (sumTime == 0) {
            throw new ChartCalculateException.TypeChartCalculateException("所有类型总时间不能为0");
        }
        Map<TypeDo, Integer> typeAndTimeMap = calculateEachTypeTime(projectTimeList);
        typeAndTimeMap.forEach((type, time) -> {
            PieCountVo countVo = buildPipeCountVo(sumTime, type, time);
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

    private PieCountVo buildPipeCountVo(int totalMinutes, TypeDo type, Integer time) {
        PieCountVo countVo = new PieCountVo();
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

    /**
     * 通用类，在统计月份和周的项目类型时间占用时将项目时间实体类转换成此类，方便进行统计
     */
    private static class ProjectTime {
        private Integer minutes;
        private Integer projectId;
    }


}

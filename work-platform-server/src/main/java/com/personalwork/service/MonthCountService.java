package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.dao.RecordMonthMapper;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.modal.entity.MonthProjectCountDo;
import com.personalwork.modal.entity.ProjectTimeDo;
import com.personalwork.modal.entity.RecordMonthDo;
import com.personalwork.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author 姚礼林
 * @desc 统计月份的项目时间，比如某个项目在这个月份中占了多少时间，以及占比
 * @date 2024/3/22
 */
@Service
public class MonthCountService {

    private final RecordMonthMapper monthMapper;
    private final ProjectTimeMapper projectTimeMapper;
    private final MonthProjectCountMapper monthProjectCountMapper;

    @Autowired
    public MonthCountService(ProjectTimeMapper projectTimeMapper, RecordMonthMapper monthMapper, MonthProjectCountMapper monthProjectCountMapper) {
        this.projectTimeMapper = projectTimeMapper;
        this.monthMapper = monthMapper;
        this.monthProjectCountMapper = monthProjectCountMapper;

    }

    /**
     * 统计指定月份的项目时间
     */
    @Transactional(rollbackFor = Exception.class)
    public void countMonthProjectTime(int year, int month) {
        verifyParam(year, month);
        List<ProjectTimeDo> projectTimeDoList = getProjectTimeList(year, month);
        countMonthProjectTime(year, month, projectTimeDoList);
    }

    private void countMonthProjectTime(int year, int month,List<ProjectTimeDo> projectTimeDoList) {
        if (projectTimeDoList.isEmpty()) {
            return;
        }
        Map<Integer, Integer> countData = computeEachProjectTime(projectTimeDoList);
        int totalMinute = countData.values().stream().mapToInt(i -> i).sum();
        RecordMonthDo recordMonthDo = alterDbRecordMonth(year, month, totalMinute);
        int monthId = recordMonthDo.getId();
        List<MonthProjectCountDo> countListDb = monthProjectCountMapper.list(monthId);
        updateDbMonthProjectTimeCount(countData, countListDb);
        insertMonthProjectTimeCountIfNotPresentInDb(countData, monthId, countListDb);
    }

    private void verifyParam(int year, int month) {
        if (year < 0 || String.valueOf(year).length() != 4) {
            throw new MethodParamInvalidException("年份参数错误，年份："+ year);
        }
        if (month < 1 || month > 12) {
            throw new MethodParamInvalidException("月份参数错误，月份：" + month);
        }
    }

    /**
     * 重新统计所有月份的项目时间
     */
    public void reCountAll(){
        List<ProjectTimeDo> projectTimeDoList = projectTimeMapper.getAllProjectTime();
        Map<String, List<ProjectTimeDo>> projectTimeMap = groupProjectTimeByMonth(projectTimeDoList);
        projectTimeMap.forEach((k, v) -> {
            int year = Integer.parseInt(k.split("-")[0]);
            int month = Integer.parseInt(k.split("-")[1]);
            countMonthProjectTime(year, month, v);
        });
    }

    private Map<String, List<ProjectTimeDo>> groupProjectTimeByMonth(List<ProjectTimeDo> projectTimeDoList) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return projectTimeDoList.stream().collect(Collectors.groupingBy(project -> {
                    LocalDate date = LocalDate.parse(project.getDate(), formatter);
                    return date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                }));
    }

    /**
     * 如果数据库中没有包含本次统计的项目，则添加新数据到数据库
     */
    private void insertMonthProjectTimeCountIfNotPresentInDb(Map<Integer, Integer> countData, int monthId,
                                                             List<MonthProjectCountDo> monthProjectCountDoList) {
        countData.forEach((key, value) -> {
            boolean isExistInDb = monthProjectCountDoList.stream().anyMatch(i -> i.getProjectId().equals(key));
            if (!isExistInDb) {
                MonthProjectCountDo countDo = new MonthProjectCountDo();
                countDo.setMinute(value);
                countDo.setProjectId(key);
                countDo.setMonthId(monthId);
                monthProjectCountMapper.insert(countDo);
            }
        });
    }

    private void updateDbMonthProjectTimeCount(Map<Integer, Integer> countData, List<MonthProjectCountDo> countListDb) {
        countListDb.forEach(c -> {
            boolean isExist = countData.containsKey(c.getProjectId());
            if (isExist) {
                // 对于数据库中已经存在的统计，如果时间与当前统计的不同则更新
                Integer minute = countData.get(c.getProjectId());
                if (!minute.equals(c.getMinute())) {
                    c.setMinute(minute);
                    monthProjectCountMapper.update(c);
                }
            } else {
                // 删除数据库中已经没用的项目时间统计
                monthProjectCountMapper.delete(c.getId());
            }
        });
    }

    private RecordMonthDo alterDbRecordMonth(int year, int month, int totalMinute) {
        RecordMonthDo recordMonthDo = monthMapper.getByDate(year, month);
        if (recordMonthDo == null) {
            recordMonthDo = buildRecordMonthDo(year, month, totalMinute);
            monthMapper.insert(recordMonthDo);
            recordMonthDo = monthMapper.getByDate(year, month);
        } else {
            recordMonthDo.setWorkTime(totalMinute);
            monthMapper.update(recordMonthDo);
        }
        return recordMonthDo;
    }

    private  RecordMonthDo buildRecordMonthDo(int year, int month, int totalMinute) {
        RecordMonthDo recordMonthDo;
        recordMonthDo = new RecordMonthDo();
        recordMonthDo.setYear(year);
        recordMonthDo.setMonth(month);
        recordMonthDo.setWorkTime(totalMinute);
        recordMonthDo.setIsSummarize(0);
        return recordMonthDo;
    }

    private  Map<Integer, Integer> computeEachProjectTime(List<ProjectTimeDo> projectTimeDoList) {
        // 统计每个项目在这个月所用的时间
        Map<Integer, Integer> countData = new HashMap<>(10);
        for (ProjectTimeDo projectTimeDo : projectTimeDoList) {
            int projectId = projectTimeDo.getProject().getId();
            int minutes = TimeUtils.getMinutes(projectTimeDo.getStartTime(), projectTimeDo.getEndTime());
            countData.put(projectId, countData.getOrDefault(projectId, 0) + minutes);
        }
        return countData;
    }

    private List<ProjectTimeDo> getProjectTimeList(int year, int month) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.YEAR, year);
        calendar.set(Calendar.MONTH, month -1);
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        String startDate = dateFormat.format(calendar.getTime());
        calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
        String endDate = dateFormat.format(calendar.getTime());
        return projectTimeMapper.getProjectTimesByRange(startDate, endDate);
    }



}

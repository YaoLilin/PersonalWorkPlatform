package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.RecordMonthMapper;
import com.personalwork.domain.dto.MonthProjectCountDto;
import com.personalwork.domain.dto.MonthRecordDto;
import com.personalwork.domain.entity.MonthProjectCountDo;
import com.personalwork.domain.entity.ProjectDo;
import com.personalwork.domain.entity.RecordMonthDo;
import com.personalwork.domain.query.MonthFormParam;
import com.personalwork.domain.vo.ScheduleEventVo;
import com.personalwork.system.cache.RedisKeyConstants;
import com.personalwork.util.RedisUtil;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;

/**
 * @author 姚礼林
 * @desc 月份记录业务类
 * @date 2024/1/22
 */
@Service
public class MonthRecordService {

    private final RecordMonthMapper monthMapper;
    private final MonthProjectCountMapper monthProjectCountMapper;
    private final ProjectMapper projectMapper;
    private final RedisUtil redisUtil;
    private final TaskTimeCountService taskTimeCountService;

    @Autowired
    public MonthRecordService(RecordMonthMapper monthMapper, MonthProjectCountMapper monthProjectCountMapper
    , ProjectMapper projectMapper, RedisUtil redisUtil, TaskTimeCountService taskTimeCountService) {
        this.monthMapper = monthMapper;
        this.monthProjectCountMapper = monthProjectCountMapper;
        this.projectMapper = projectMapper;
        this.redisUtil = redisUtil;
        this.taskTimeCountService = taskTimeCountService;
    }

    public List<MonthRecordDto> getWorkMonthRecordList() {
        List<RecordMonthDo> months = monthMapper.list(UserUtil.getLoginUserId());
        return buildMonthRecordDtoList(months);
    }

    public List<MonthRecordDto> getWorkMonthRecordList(Integer startYear, Integer startMonth,
                                                       Integer endYear, Integer endMonth){
        List<RecordMonthDo> months = monthMapper.listRange(startYear,startMonth,endYear
                ,endMonth,UserUtil.getLoginUserId());
        return buildMonthRecordDtoList(months);
    }

    public boolean saveForm(Integer id, MonthFormParam param) {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(id);
        recordMonthDo.setMark(param.getMark());
        recordMonthDo.setSummary(param.getSummary());
        recordMonthDo.setIsSummarize(1);
        if (!monthMapper.update(recordMonthDo)) {
            return false;
        }
        redisUtil.delete(RedisKeyConstants.MONTH_LIST_KEY + UserUtil.getLoginUserId());
        return true;
    }

    public MonthRecordDto getMonth(Integer monthId) {
        RecordMonthDo monthDo = monthMapper.getById(monthId);
        List<MonthProjectCountDo> countList = monthProjectCountMapper.list(monthDo.getId());
        return buildMonthRecordDto(monthDo, countList, taskTimeCountService.listEvents());

    }

    private List<MonthRecordDto> buildMonthRecordDtoList(List<RecordMonthDo> months) {
        List<MonthRecordDto> result = new ArrayList<>();
        List<ScheduleEventVo> events = taskTimeCountService.listEvents();
        months.forEach(month ->{
            List<MonthProjectCountDo> countList = monthProjectCountMapper.list(month.getId());
            MonthRecordDto recordDto = buildMonthRecordDto(month, countList, events);
            result.add(recordDto);
        });
        return result;
    }

    private MonthRecordDto buildMonthRecordDto(RecordMonthDo month, List<MonthProjectCountDo> monthProjectCountList,
                                                List<ScheduleEventVo> events) {
        MonthRecordDto recordDto = new MonthRecordDto();
        recordDto.setRecordMonthDo(month);
        List<MonthProjectCountDto> countDtoList = new ArrayList<>();
        monthProjectCountList.forEach(i -> countDtoList.add(convertMonthProjectCountDto(i)));
        recordDto.setProjectCountList(countDtoList);
        LocalDate start = LocalDate.of(month.getYear(), month.getMonth(), 1);
        recordDto.setTaskTimeList(taskTimeCountService.count(events, start, start.plusMonths(1)));
        return recordDto;
    }

    private MonthProjectCountDto convertMonthProjectCountDto(MonthProjectCountDo countDo) {
        MonthProjectCountDto countDto = new MonthProjectCountDto();
        BeanUtils.copyProperties(countDo, countDto);
        ProjectDo projectDo = projectMapper.getProject(countDo.getProjectId());
        countDto.setProjectName(projectDo.getName());
        return countDto;
    }

}

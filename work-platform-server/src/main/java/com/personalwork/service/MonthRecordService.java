package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.RecordMonthMapper;
import com.personalwork.modal.dto.MonthProjectCountDto;
import com.personalwork.modal.dto.MonthRecordDto;
import com.personalwork.modal.entity.MonthProjectCountDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.RecordMonthDo;
import com.personalwork.modal.query.MonthFormParam;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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


    @Autowired
    public MonthRecordService(RecordMonthMapper monthMapper, MonthProjectCountMapper monthProjectCountMapper
    , ProjectMapper projectMapper) {
        this.monthMapper = monthMapper;
        this.monthProjectCountMapper = monthProjectCountMapper;
        this.projectMapper = projectMapper;
    }

    public List<MonthRecordDto> getWorkMonthRecordList() {
        List<RecordMonthDo> months = monthMapper.list();
        return buildMonthRecordDtoList(months);
    }

    public List<MonthRecordDto> getWorkMonthRecordList(Integer startYear, Integer startMonth, Integer endYear, Integer endMonth){
        List<RecordMonthDo> months = monthMapper.listRange(startYear,startMonth,endYear,endMonth);
        return buildMonthRecordDtoList(months);
    }

    private List<MonthRecordDto> buildMonthRecordDtoList(List<RecordMonthDo> months) {
        List<MonthRecordDto> result = new ArrayList<>();
        months.forEach(month ->{
            List<MonthProjectCountDo> countList = monthProjectCountMapper.list(month.getId());
            MonthRecordDto recordDto = buildMonthRecordDto(month, countList);
            result.add(recordDto);
        });
        return result;
    }

    public boolean saveForm(Integer id, MonthFormParam param) {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setId(id);
        recordMonthDo.setMark(param.mark);
        recordMonthDo.setSummary(param.summary);
        recordMonthDo.setIsSummarize(1);
        return monthMapper.update(recordMonthDo);
    }

    private MonthRecordDto buildMonthRecordDto(RecordMonthDo month, List<MonthProjectCountDo> monthProjectCountList) {
        MonthRecordDto recordDto = new MonthRecordDto();
        recordDto.setRecordMonthDo(month);
        List<MonthProjectCountDto> countDtoList = new ArrayList<>();
        monthProjectCountList.forEach(i -> countDtoList.add(convertMonthProjectCountDto(i)));
        recordDto.setProjectCountList(countDtoList);
        return recordDto;
    }

    private MonthProjectCountDto convertMonthProjectCountDto(MonthProjectCountDo countDo) {
        MonthProjectCountDto countDto = new MonthProjectCountDto();
        BeanUtils.copyProperties(countDo, countDto);
        ProjectDo projectDo = projectMapper.getProject(countDo.getProjectId());
        countDto.setProjectName(projectDo.getName());
        return countDto;
    }

    public MonthRecordDto getMonth(Integer monthId) {
        RecordMonthDo monthDo = monthMapper.getById(monthId);
        List<MonthProjectCountDo> countList = monthProjectCountMapper.list(monthDo.getId());
        return buildMonthRecordDto(monthDo, countList);

    }
}

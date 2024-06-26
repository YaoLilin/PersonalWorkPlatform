package com.personalwork.service;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.ProjectTimeMapper;
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

import java.util.*;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/22
 */
@Service
public class MonthRecordService {

    private final RecordMonthMapper monthMapper;
    private final ProjectTimeMapper projectTimeMapper;
    private final MonthProjectCountMapper monthProjectCountMapper;
    private final ProjectMapper projectMapper;


    @Autowired
    public MonthRecordService(RecordMonthMapper monthMapper, ProjectTimeMapper projectTimeMapper, MonthProjectCountMapper monthProjectCountMapper
    , ProjectMapper projectMapper) {
        this.monthMapper = monthMapper;
        this.projectTimeMapper = projectTimeMapper;
        this.monthProjectCountMapper = monthProjectCountMapper;
        this.projectMapper = projectMapper;
    }

    public List<MonthRecordDto> getWorkMonthList() {
        List<RecordMonthDo> months = monthMapper.list();
        List<MonthRecordDto> result = new ArrayList<>();
        months.forEach(o ->{
            List<MonthProjectCountDo> countList = monthProjectCountMapper.list(o.getId());
            MonthRecordDto recordDto = getMonthRecordDto(o, countList);
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

    private MonthRecordDto getMonthRecordDto(RecordMonthDo o, List<MonthProjectCountDo> countList) {
        MonthRecordDto recordDto = new MonthRecordDto();
        recordDto.setRecordMonthDo(o);
        List<MonthProjectCountDto> countDtoList = new ArrayList<>();
        countList.forEach(i ->{
            MonthProjectCountDto countDto = new MonthProjectCountDto();
            BeanUtils.copyProperties(i, countDto);
            ProjectDo projectDo = projectMapper.getProject(i.getProjectId());
            countDto.setProjectName(projectDo.getName());
            countDtoList.add(countDto);
        });
        recordDto.setProjectCountList(countDtoList);
        return recordDto;
    }


    public MonthRecordDto getMonth(Integer monthId) {
        RecordMonthDo monthDo = monthMapper.getById(monthId);
        List<MonthProjectCountDo> countList = monthProjectCountMapper.list(monthDo.getId());
        return getMonthRecordDto(monthDo, countList);

    }
}

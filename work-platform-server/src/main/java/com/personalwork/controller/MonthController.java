package com.personalwork.controller;

import com.personalwork.modal.dto.MonthRecordDto;
import com.personalwork.modal.query.MonthFormParam;
import com.personalwork.modal.vo.MonthProjectTimeVo;
import com.personalwork.modal.vo.MonthVo;
import com.personalwork.service.MonthCountService;
import com.personalwork.service.MonthRecordService;
import com.personalwork.util.NumberUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/24
 */
@RestController
@RequestMapping("/statistics/months")
public class MonthController {
    private final MonthRecordService monthRecordService;
    private final MonthCountService monthCountService;

    @Autowired
    public MonthController(MonthRecordService monthRecordService, MonthCountService monthCountService) {
        this.monthRecordService = monthRecordService;
        this.monthCountService = monthCountService;
    }

    @GetMapping
    public List<MonthVo> getMonths(){
        List<MonthRecordDto> monthDtoList = monthRecordService.getWorkMonthRecordList();
        List<MonthVo> months = new ArrayList<>();
        monthDtoList.forEach(o ->{
            MonthVo vo = getMonthVo(o);
            months.add(vo);
        });
        return months;
    }

    @PutMapping("/{id}")
    public boolean saveForm(@PathVariable Integer id, @RequestBody @Validated MonthFormParam param) {
        return monthRecordService.saveForm(id,param);
    }

    @PutMapping("/recount")
    public void reCount() {
        monthCountService.reCountAll();
    }

    @GetMapping("/{id}")
    public MonthVo getMonth(@PathVariable Integer id) {
        MonthRecordDto recordDto = monthRecordService.getMonth(id);
        return getMonthVo(recordDto);
    }

    private  MonthVo getMonthVo(MonthRecordDto o) {
        MonthVo vo = new MonthVo();
        BeanUtils.copyProperties(o.getRecordMonthDo(),vo);
        vo.setIsSummarize(Objects.equals(o.getRecordMonthDo().getIsSummarize(),1));
        double hours = Double.parseDouble(NumberUtil.round((double) o.getRecordMonthDo().getWorkTime() / 60,
                1, false));
        List<MonthProjectTimeVo> projectTime = new ArrayList<>();
        o.getProjectCountList().forEach(i ->{
            double projectHours = Double.parseDouble(NumberUtil.round((double) i.getMinute() / 60,
                    1, false));
            double percent = Double.parseDouble(NumberUtil.round((double) i.getMinute() /
                    o.getRecordMonthDo().getWorkTime() * 100, 0, true));
            MonthProjectTimeVo timeVo = new MonthProjectTimeVo();
            timeVo.setMinutes(i.getMinute());
            timeVo.setHours(projectHours);
            timeVo.setPercent(percent);
            timeVo.setProjectName(i.getProjectName());
            projectTime.add(timeVo);
        });
        vo.setProjectTime(projectTime);
        vo.setHours(hours);
        return vo;
    }

}

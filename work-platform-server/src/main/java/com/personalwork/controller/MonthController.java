package com.personalwork.controller;

import com.personalwork.domain.dto.MonthRecordDto;
import com.personalwork.domain.query.MonthFormParam;
import com.personalwork.domain.vo.MonthProjectTimeVo;
import com.personalwork.domain.vo.MonthVo;
import com.personalwork.service.MonthCountService;
import com.personalwork.service.MonthRecordService;
import com.personalwork.system.cache.Cache;
import com.personalwork.system.cache.DeleteCache;
import com.personalwork.system.cache.RedisKeyConstants;
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
 * @desc 月工作记录相关接口
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
    @Cache(key = RedisKeyConstants.MONTH_LIST_KEY,isUserData = true,expire = RedisKeyConstants.MONTH_LIST_TTL,
            listElementType = MonthVo.class)
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
    @DeleteCache(value = RedisKeyConstants.MONTH_LIST_KEY,isUserData = true)
    public boolean saveForm(@PathVariable Integer id, @RequestBody @Validated MonthFormParam param) {
        return monthRecordService.saveForm(id,param);
    }

    @PutMapping("/recount")
    @DeleteCache(value = RedisKeyConstants.MONTH_LIST_KEY,isUserData = true)
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
        int totalMinutes = o.getTaskTimeList().stream().mapToInt(i -> i.minutes()).sum();
        double hours = NumberUtil.round((double) totalMinutes / 60,
                1, false);
        List<MonthProjectTimeVo> projectTime = new ArrayList<>();
        o.getTaskTimeList().forEach(i ->{
            double projectHours = NumberUtil.round((double) i.minutes() / 60,
                    1, false);
            double percent = totalMinutes == 0 ? 0 : NumberUtil.round((double) i.minutes() /
                    totalMinutes * 100, 0, true);
            MonthProjectTimeVo timeVo = new MonthProjectTimeVo();
            timeVo.setMinutes(i.minutes());
            timeVo.setHours(projectHours);
            timeVo.setPercent(percent);
            timeVo.setProjectName(i.name());
            timeVo.setChecklist(i.isChecklist());
            projectTime.add(timeVo);
        });
        vo.setProjectTime(projectTime);
        vo.setHours(hours);
        vo.setMinutes(totalMinutes);
        return vo;
    }

}

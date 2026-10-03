package com.personalwork.service;

import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.domain.dto.TaskTimeDto;
import com.personalwork.domain.entity.RecordWeekDo;
import com.personalwork.domain.vo.ScheduleEventVo;
import com.personalwork.domain.vo.WeekProjectTimeVo;
import com.personalwork.domain.vo.WeeksVo;
import com.personalwork.util.NumberUtil;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * @author 姚礼林
 * @desc 周记录列表业务
 * @date 2023/9/17
 */
@Service
public class WeekListService {
    private final RecordWeekMapper recordWeekMapper;
    private final TaskTimeCountService taskTimeCountService;

    @Autowired
    public WeekListService(RecordWeekMapper recordWeekMapper, TaskTimeCountService taskTimeCountService) {
        this.recordWeekMapper = recordWeekMapper;
        this.taskTimeCountService = taskTimeCountService;
    }

    public List<WeeksVo> getCardList() {
        List<RecordWeekDo> weekList = recordWeekMapper.getWorkWeekList(UserUtil.getLoginUserId());
        return getWeeksVos(weekList);
    }

    private List<WeeksVo> getWeeksVos(List<RecordWeekDo> weekList) {
        List<WeeksVo> result = new ArrayList<>();
        DecimalFormat df = new DecimalFormat("0.00");
        DecimalFormat df2 = new DecimalFormat("0");
        List<ScheduleEventVo> events = taskTimeCountService.listEvents();
        for (RecordWeekDo recordWeekDo : weekList) {
            LocalDate weekStart = LocalDate.parse(recordWeekDo.getDate());
            List<TaskTimeDto> taskTimes = taskTimeCountService.count(
                    events, weekStart, weekStart.plusWeeks(1));
            int weekUseMinutes = taskTimes.stream().mapToInt(TaskTimeDto::minutes).sum();
            double totalHours = Double.parseDouble(df.format((double) weekUseMinutes / 60));
            List<WeekProjectTimeVo> projectTimeList = getWeekProjectTimeVos(df2, weekUseMinutes, taskTimes);
            WeeksVo weeksVo = new WeeksVo();
            BeanUtils.copyProperties(recordWeekDo, weeksVo);
            weeksVo.setHours(totalHours);
            weeksVo.setProjectTime(projectTimeList);
            result.add(weeksVo);
        }
        return result;
    }

    private List<WeekProjectTimeVo> getWeekProjectTimeVos(DecimalFormat df2, int weekUseMinutes,
                                                          List<TaskTimeDto> taskTimes) {
        List<WeekProjectTimeVo> projectTimeList = new ArrayList<>();
        for (TaskTimeDto count : taskTimes) {
            WeekProjectTimeVo weekProjectTimeVo = buildWeekProjectTimeVo(df2, weekUseMinutes, count);
            projectTimeList.add(weekProjectTimeVo);
        }
        return projectTimeList;
    }

    private WeekProjectTimeVo buildWeekProjectTimeVo(DecimalFormat df2, int weekUseMinutes,
                                                     TaskTimeDto count) {
        WeekProjectTimeVo weekProjectTimeVo = new WeekProjectTimeVo();
        double projectHours = NumberUtil.round((double) count.minutes() / 60,
                2, true);
        double percent = weekUseMinutes == 0 ? 0 : Math.round((double) count.minutes() / weekUseMinutes * 100);
        weekProjectTimeVo.setProjectName(count.name());
        weekProjectTimeVo.setChecklist(count.isChecklist());
        weekProjectTimeVo.setMinutes(count.minutes());
        weekProjectTimeVo.setHours(projectHours);
        weekProjectTimeVo.setPercent(df2.format(percent));
        return weekProjectTimeVo;
    }
}

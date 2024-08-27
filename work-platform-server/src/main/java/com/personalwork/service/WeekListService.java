package com.personalwork.service;

import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.RecordWeekDo;
import com.personalwork.modal.vo.WeeksVo;
import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import com.personalwork.modal.vo.WeekProjectTimeVo;
import com.personalwork.util.NumberUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/9/17
 */
@Service
public class WeekListService {


    private final RecordWeekMapper recordWeekMapper;
    private final WeekProjectTimeCountMapper projectTimeCountMapper;
    private final ProjectMapper projectMapper;

    @Autowired
    public WeekListService(RecordWeekMapper recordWeekMapper, WeekProjectTimeCountMapper projectTimeCountMapper,
                           ProjectMapper projectMapper, ProjectMapper projectMapper1) {
        this.recordWeekMapper = recordWeekMapper;
        this.projectTimeCountMapper = projectTimeCountMapper;
        this.projectMapper = projectMapper1;
    }

    public List<WeeksVo> getCardList() {
        List<WeeksVo> result = new ArrayList<>();
        List<RecordWeekDo> weekList = recordWeekMapper.getWorkWeekList();
        DecimalFormat df = new DecimalFormat("0.00");
        DecimalFormat df2 = new DecimalFormat("0");
        for (RecordWeekDo recordWeekDo : weekList) {
            int weekUseMinutes = recordWeekDo.getTime();
            double totalHours = Double.parseDouble(df.format((double) weekUseMinutes / 60));
            // 获取项目的占用时间
            List<WeekProjectTimeCountDo> projectTimeCountList = projectTimeCountMapper.listByWeekId(recordWeekDo.getId());
            List<WeekProjectTimeVo> projectTimeList = getWeekProjectTimeVos(df2, weekUseMinutes, projectTimeCountList);
            WeeksVo weeksVo = new WeeksVo();
            BeanUtils.copyProperties(recordWeekDo,weeksVo);
            weeksVo.setHours(totalHours);
            weeksVo.setProjectTime(projectTimeList);
            result.add(weeksVo);
        }

        return result;
    }

    private List<WeekProjectTimeVo> getWeekProjectTimeVos(DecimalFormat df2, int weekUseMinutes,
                                                          List<WeekProjectTimeCountDo> projectTimeCountList) {
        List<WeekProjectTimeVo> projectTimeList = new ArrayList<>();
        for (WeekProjectTimeCountDo count : projectTimeCountList) {
            WeekProjectTimeVo weekProjectTimeVo = buildWeekProjectTimeVo(df2, weekUseMinutes, count);
            projectTimeList.add(weekProjectTimeVo);
        }
        return projectTimeList;
    }

    private WeekProjectTimeVo buildWeekProjectTimeVo(DecimalFormat df2, int weekUseMinutes, WeekProjectTimeCountDo count) {
        WeekProjectTimeVo weekProjectTimeVo = new WeekProjectTimeVo();
        ProjectDo project = projectMapper.getProject(count.getProject());
        double projectHours = NumberUtil.round((double) count.getMinutes() / 60,
                2,true);
        double percent = Math.round((double) count.getMinutes() / weekUseMinutes * 100) ;
        weekProjectTimeVo.setProjectName(project.getName());
        weekProjectTimeVo.setMinutes(count.getMinutes());
        weekProjectTimeVo.setHours(projectHours);
        weekProjectTimeVo.setPercent(df2.format(percent));
        return weekProjectTimeVo;
    }
}

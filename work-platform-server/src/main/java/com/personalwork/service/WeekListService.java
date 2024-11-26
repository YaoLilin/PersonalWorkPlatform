package com.personalwork.service;

import com.personalwork.dao.ProjectMapper;
import com.personalwork.dao.RecordWeekMapper;
import com.personalwork.dao.WeekProjectTimeCountMapper;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.RecordWeekDo;
import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import com.personalwork.modal.vo.WeekProjectTimeVo;
import com.personalwork.modal.vo.WeeksVo;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.system.cache.RedisKeyConstants;
import com.personalwork.util.NumberUtil;
import com.personalwork.util.RedisUtil;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * @author 姚礼林
 * @desc 周记录列表业务
 * @date 2023/9/17
 */
@Service
public class WeekListService {
    private final RecordWeekMapper recordWeekMapper;
    private final WeekProjectTimeCountMapper projectTimeCountMapper;
    private final ProjectMapper projectMapper;
    private final RedisUtil redisUtil;

    @Autowired
    public WeekListService(RecordWeekMapper recordWeekMapper, WeekProjectTimeCountMapper projectTimeCountMapper,
                           ProjectMapper projectMapper, RedisUtil redisUtil) {
        this.recordWeekMapper = recordWeekMapper;
        this.projectTimeCountMapper = projectTimeCountMapper;
        this.projectMapper = projectMapper;
        this.redisUtil = redisUtil;
    }

    public List<WeeksVo> getCardList() {
        UserDetail loginUser = Objects.requireNonNull(UserUtil.getLoginUser());
        String redisKey = RedisKeyConstants.WEEK_LIST_KEY + loginUser.getId();
        List<WeeksVo> cacheValue = redisUtil.getList(redisKey, WeeksVo.class);
        if (cacheValue != null) {
            return cacheValue;
        }
        List<RecordWeekDo> weekList = recordWeekMapper.getWorkWeekList(loginUser.getId());
        List<WeeksVo> result = getWeeksVos(weekList);
        redisUtil.set(redisKey,result,RedisKeyConstants.WEEK_LIST_TTL, TimeUnit.SECONDS);
        return result;
    }

    private List<WeeksVo> getWeeksVos(List<RecordWeekDo> weekList) {
        List<WeeksVo> result = new ArrayList<>();
        DecimalFormat df = new DecimalFormat("0.00");
        DecimalFormat df2 = new DecimalFormat("0");
        for (RecordWeekDo recordWeekDo : weekList) {
            int weekUseMinutes = recordWeekDo.getTime();
            double totalHours = Double.parseDouble(df.format((double) weekUseMinutes / 60));
            // 获取项目的占用时间
            List<WeekProjectTimeCountDo> projectTimeCountList = projectTimeCountMapper.listByWeekId(recordWeekDo.getId());
            List<WeekProjectTimeVo> projectTimeList = getWeekProjectTimeVos(df2, weekUseMinutes, projectTimeCountList);
            WeeksVo weeksVo = new WeeksVo();
            BeanUtils.copyProperties(recordWeekDo, weeksVo);
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
                2, true);
        double percent = Math.round((double) count.getMinutes() / weekUseMinutes * 100);
        weekProjectTimeVo.setProjectName(project.getName());
        weekProjectTimeVo.setMinutes(count.getMinutes());
        weekProjectTimeVo.setHours(projectHours);
        weekProjectTimeVo.setPercent(df2.format(percent));
        return weekProjectTimeVo;
    }
}

package com.personalwork.service.count;

import com.personalwork.dao.MonthProjectCountMapper;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.enu.CountType;
import com.personalwork.exception.ChartCalculateException;
import com.personalwork.modal.dto.MonthProjectCountDto;
import com.personalwork.modal.dto.MonthRecordDto;
import com.personalwork.modal.dto.MonthTimeCountDto;
import com.personalwork.modal.dto.ProjectTimeCountDto;
import com.personalwork.modal.entity.MonthProjectCountDo;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.query.TimeCountChartParam;
import com.personalwork.modal.vo.PieCountVo;
import com.personalwork.service.count.bean.ProjectTime;
import com.personalwork.service.count.manage.MonthRecordManager;
import com.personalwork.service.count.manage.ProjectTypeCountManager;
import com.personalwork.service.count.util.ParamUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * @author yaolilin
 * @desc 月工作时间统计
 * @date 2024/8/26
 **/
@Service
@RequiredArgsConstructor
public class MonthWorkTimeCountService {
    private final ProjectMapper projectMapper;
    private final MonthProjectCountMapper monthProjectCountMapper;
    private final MonthRecordManager monthRecordManager;
    private final ProjectTypeCountManager projectTypeCountManager;

    /**
     * 统计每个项目（或类型）每月的工作时间
     * @param param 条件参数
     * @return 统计结果集合
     */
    public List<MonthTimeCountDto> monthWorkTimeCount(TimeCountChartParam param) {
        List<MonthRecordDto> monthRecordList = monthRecordManager.getMonthRecordList(param);
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
            projectTime.setMinutes(i.getMinute());
            projectTime.setProjectId(i.getProjectId());
            projectTimeList.add(projectTime);
        });

        return projectTypeCountManager.countProjectTypeTime(projectTimeList);
    }


    private MonthTimeCountDto buildMonthTimeCountDto(TimeCountChartParam param, MonthRecordDto month,
                                                     List<MonthProjectCountDto> projectCountList) {
        List<ProjectTimeCountDto> items = new ArrayList<>();
        for (MonthProjectCountDto projectCount : projectCountList) {
            ProjectDo projectDo = projectMapper.getProject(projectCount.getProjectId());
            if (param.getCountType() == CountType.PROJECT && !ParamUtil.inParamProjects(param, projectDo)) {
                continue;
            }
            if (param.getCountType() == CountType.TYPE && !ParamUtil.inParamTypes(param, projectDo)) {
                continue;
            }
            ProjectTimeCountDto item = new ProjectTimeCountDto(projectDo, projectCount.getMinute());
            items.add(item);
        }
        return new MonthTimeCountDto(month.getRecordMonthDo(),items);
    }




}

package com.personalwork.service.count;

import com.personalwork.constants.CountType;
import com.personalwork.dao.ProjectMapper;
import com.personalwork.domain.dto.MonthProjectCountDto;
import com.personalwork.domain.dto.MonthRecordDto;
import com.personalwork.domain.dto.WorkTimeProportionDto;
import com.personalwork.domain.entity.ProjectDo;
import com.personalwork.domain.query.TimeCountChartParam;
import com.personalwork.service.count.manage.MonthRecordManager;
import com.personalwork.service.count.util.ParamUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * @author 姚礼林
 * @desc 统计图数据业务类
 * @date 2024/3/26
 */
@RequiredArgsConstructor
@Service
public class ChartService {
    private final ProjectMapper projectMapper;
    private final MonthRecordManager monthRecordManager;

    /**
     * 按月统计每个项目或类型的工作时间占比
     * @param param 条件参数
     * @return 工作时间占比，集合每个元素对应一个项目或类型的工作时间占比信息
     */
    public List<WorkTimeProportionDto> workTimeProportionCount(TimeCountChartParam param) {
        Map<Integer, ProjectDo> projectDoMap = new HashMap<>();
        List<MonthRecordDto> monthRecordList = monthRecordManager.getMonthRecordList(param);
        Map<Integer, WorkTimeProportionDto> workTimeMap = new LinkedHashMap<>(10);
        for (MonthRecordDto month : monthRecordList) {
            for (MonthProjectCountDto projectCount : month.getProjectCountList()) {
                ProjectDo projectDo = projectDoMap.computeIfAbsent(projectCount.getProjectId(),
                        k -> projectMapper.getProject(projectCount.getProjectId()));
                WorkTimeProportionDto workTime;
                if (param.getCountType() == CountType.PROJECT) {
                    if (!ParamUtil.inParamProjects(param, projectDo)) {
                        continue;
                    }
                    workTime = workTimeMap.computeIfAbsent(projectCount.getProjectId(),
                            k -> new WorkTimeProportionDto(projectDo, null, 0));
                }else {
                    if (!ParamUtil.inParamTypes(param, projectDo)) {
                        continue;
                    }
                    workTime = workTimeMap.computeIfAbsent(projectDo.getType().getId(),
                            k -> new WorkTimeProportionDto(null, projectDo.getType(), 0));
                }
                workTime.setMinutes(workTime.getMinutes() + projectCount.getMinute());
            }
        }
        return new ArrayList<>(workTimeMap.values());
    }

}

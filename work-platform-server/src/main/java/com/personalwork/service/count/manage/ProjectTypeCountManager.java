package com.personalwork.service.count.manage;

import com.personalwork.dao.ProjectMapper;
import com.personalwork.exception.ChartCalculateException;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.vo.PieCountVo;
import com.personalwork.service.count.util.ModelUtil;
import com.personalwork.service.count.bean.ProjectTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author yaolilin
 * @desc 按项目类别统计工作时间
 * @date 2024/8/26
 **/
@RequiredArgsConstructor
@Service
public class ProjectTypeCountManager {
    private final ProjectMapper projectMapper;

    /**
     * 统计各项目类型所占用的时间
     *
     * @param projectTimeList 所有项目时间记录，从数据库中获取
     * @return 统计的各项目类型所占用的时间，包含占比
     */
    public   List<PieCountVo> countProjectTypeTime(List<ProjectTime> projectTimeList) {
        List<PieCountVo> result = new ArrayList<>();
        int sumTime = projectTimeList.stream().mapToInt(i -> i.getMinutes()).sum();
        if (sumTime == 0) {
            throw new ChartCalculateException.TypeChartCalculateException("所有类型总时间不能为0");
        }
        Map<TypeDo, Integer> typeAndTimeMap = calculateEachTypeTime(projectTimeList);
        typeAndTimeMap.forEach((type, time) -> {
            PieCountVo countVo = ModelUtil.buildPipeCountVo(sumTime, type, time);
            result.add(countVo);
        });
        return result;
    }

    private Map<TypeDo, Integer> calculateEachTypeTime(List<ProjectTime> projectTimeList) {
        Map<Integer, TypeDo> projectIdAndTypeMap = getProjectIdTypeMap(projectTimeList);
        Map<TypeDo, Integer> typeAndTimeMap = new HashMap<>(10);
        for (ProjectTime projectTime : projectTimeList) {
            TypeDo type = projectIdAndTypeMap.computeIfAbsent(projectTime.getProjectId(), id -> getTypeByProjectTime(projectTime));
            Integer minutes = projectTime.getMinutes();
            if (minutes != null) {
                typeAndTimeMap.put(type, typeAndTimeMap.getOrDefault(type, 0) + minutes);
            }
        }
        return typeAndTimeMap;
    }

    private Map<Integer, TypeDo> getProjectIdTypeMap(List<ProjectTime> projectTimeList) {
        Map<Integer, TypeDo> projectIdTypeMap = new HashMap<>(10);
        for (ProjectTime projectTime : projectTimeList) {
            TypeDo type = getTypeByProjectTime(projectTime);
            projectIdTypeMap.computeIfAbsent(projectTime.getProjectId(), id -> type);
        }
        return projectIdTypeMap;
    }

    private TypeDo getTypeByProjectTime(ProjectTime projectTime) {
        Integer projectId = projectTime.getProjectId();
        ProjectDo projectDo = projectMapper.getProject(projectId);
        return projectDo.getType();
    }
}

package com.personalwork.service.count.util;

import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.query.TimeCountChartParam;

/**
 * @author yaolilin
 * @desc 接口参数工具类
 * @date 2024/8/26
 **/
public class ParamUtil {
    public static boolean inParamProjects(TimeCountChartParam param, ProjectDo projectDo) {
        if (param.getProjects() != null && !param.getProjects().isEmpty()) {
            return param.getProjects().contains(projectDo.getId());
        }
        return true;
    }

    public static  boolean inParamTypes(TimeCountChartParam param, ProjectDo projectDo) {
        if (param.getTypes() != null && !param.getTypes().isEmpty()) {
            return param.getTypes().contains(projectDo.getType().getId());
        }
        return true;
    }
}

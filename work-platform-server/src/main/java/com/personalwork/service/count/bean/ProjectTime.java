package com.personalwork.service.count.bean;

import lombok.Data;

/**
 * @author yaolilin
 * @desc 通用类，在统计月份和周的项目类型时间占用时将项目时间实体类转换成此类，方便进行统计
 * @date 2024/8/26
 **/
@Data
public class ProjectTime {
    private Integer minutes;
    private Integer projectId;
}

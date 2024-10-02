package com.personalwork.modal.query;

import com.personalwork.constants.CountType;
import com.personalwork.constants.TimeRange;
import com.personalwork.validation.constraints.ValidDate;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 工作时间统计图的查询条件
 * @date 2024/7/9
 */
@Data
public class TimeCountChartParam {
    @NotNull(message = "日期范围类型不能为空或不在范围内")
    private TimeRange timeRange;
    @NotNull(message = "统计纬度不能为空或不在范围内")
    private CountType countType;
    private List<Integer> projects;
    private List<Integer> types;
    @ValidDate(message = "开始日期格式错误")
    private String startDate;
    @ValidDate(message = "结束日期格式错误")
    private String endDate;
    private Integer userId;
}

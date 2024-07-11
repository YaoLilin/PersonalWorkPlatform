package com.personalwork.modal.query;

import com.personalwork.annotaton.ValidDate;
import com.personalwork.enu.CountType;
import com.personalwork.enu.TimeRange;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Range;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/9
 */
@Data
public class WeekTimeCountParam {
    @NotNull(message = "日期范围类型不能为空")
    @Range(min = 0, max = 3,message = "日期范围类型不在选项范围内")
    private TimeRange timeRange;
    @NotNull(message = "统计纬度不能为空")
    private CountType countType;
    private Integer[] projects;
    private Integer[] types;
    @ValidDate(message = "开始日期格式错误")
    private String startDate;
    @ValidDate(message = "结束日期格式错误")
    private String endDate;
}

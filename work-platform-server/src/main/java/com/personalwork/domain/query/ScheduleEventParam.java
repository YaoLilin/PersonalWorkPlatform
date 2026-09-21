package com.personalwork.domain.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 日程新增和编辑参数。<br>
 * <p>日程名称独立于项目名称保存；关联清单时，名称将同步为清单名称。</p>
 *
 * @author 姚礼林
 */
@Data
public class ScheduleEventParam {
    private Integer projectId;
    private Integer checklistId;
    private Boolean createChecklist;
    @NotBlank(message = "日程名称不能为空")
    @Size(max = 255, message = "日程名称不能超过255个字符")
    private String scheduleName;
    @Size(max = 1000, message = "日程描述不能超过1000个字符")
    private String description;
    @NotBlank(message = "开始日期不能为空")
    private String date;
    @NotBlank(message = "结束日期不能为空")
    private String endDate;
    @NotBlank(message = "开始时间不能为空")
    private String startTime;
    @NotBlank(message = "结束时间不能为空")
    private String endTime;
}

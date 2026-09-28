package com.personalwork.domain.vo;

import lombok.Data;

/**
 * 日程任务视图对象。<br>
 * <p>对应周统计项目情况表格中的单条项目时间记录。</p>
 *
 * @author 姚礼林
 */
@Data
public class ScheduleEventVo {
    private Integer id;
    private Integer projectId;
    private String projectName;
    private String projectColor;
    private Integer checklistId;
    private String checklistName;
    /** 清单关联的项目编号；为空时按清单统计。 */
    private Integer checklistProjectId;
    private String checklistProjectName;
    private String checklistTypeColor;
    /** 清单完成状态：0 未完成，1 已完成。 */
    private Integer checklistIsDone;
    private String scheduleName;
    private String description;
    private String date;
    private String endDate;
    private String startTime;
    private String endTime;
}

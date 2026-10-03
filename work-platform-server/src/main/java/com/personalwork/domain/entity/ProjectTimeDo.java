package com.personalwork.domain.entity;

import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc 项目的工作时间记录，如 xx项目从 14:00 工作到 15:00
 * @date 2023/6/11
 */
@Data
@ToString
public class ProjectTimeDo {
    private Integer id;
    private ProjectDo project;
    private String projectName;
    private String date;
    private String endDate;
    private String startTime;
    private String endTime;
    private String scheduleName;
    private String description;
    private Integer weekId;
    private Integer checklistId;
    private String checklistName;
    private String checklistTypeColor;
    /** 清单完成状态：0 未完成，1 已完成。 */
    private Integer checklistIsDone;

    /**
     * 获取可为空的关联项目编号，供日程写入使用。
     *
     * @return 项目编号；未关联项目时为空
     */
    public Integer getProjectId() {
        return project == null ? null : project.getId();
    }
}

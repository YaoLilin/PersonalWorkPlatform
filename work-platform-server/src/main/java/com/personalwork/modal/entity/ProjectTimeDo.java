package com.personalwork.modal.entity;

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
    private int id;
    private ProjectDo project;
    private String projectName;
    private String date;
    private String startTime;
    private String endTime;
    private Integer weekId;
}

package com.personalwork.domain.dto;

import lombok.Data;

/**
 * <p>清单关联日程的时间段展示数据。</p>
 */
@Data
public class ChecklistScheduleTimeDto {
    private Integer id;
    private Integer checklistId;
    private String date;
    private String endDate;
    private String startTime;
    private String endTime;
}

package com.personalwork.domain.dto;

import lombok.Data;

import java.util.List;

/**
 * <p>清单列表展示数据。</p>
 */
@Data
public class ChecklistDto {
    private Integer id;
    private String name;
    private Integer projectId;
    private String projectName;
    private Integer isDone;
    private Integer checklistTypeId;
    private String checklistTypeName;
    private List<ChecklistScheduleTimeDto> scheduleTimes;
}

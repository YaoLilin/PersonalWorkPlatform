package com.personalwork.modal.dto;

import com.personalwork.enu.ProjectState;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/2/15
 */
@Data
public class ProjectDto {
    private Integer id;
    private String name = "";
    private String startDate =null;
    private String endDate =null;
    private String closeDate =null;
    private String  typeName;
    private Integer  typeId;
    private Double progress;
    private ProjectState state;
    private Integer  important;
    private Integer isStartDateOnly;
}

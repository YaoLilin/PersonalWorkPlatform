package com.personalwork.modal.entity;

import com.personalwork.enu.ProjectState;
import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/3/22
 */
@Data
@ToString
public class ProjectDo {
    private Integer id;
    private String name;
    private String startDate;
    private String endDate;
    private String closeDate;
    private TypeDo type;
    private Double progress;
    private ProjectState state;
    private Integer important;
    private Integer isStartDateOnly;
}

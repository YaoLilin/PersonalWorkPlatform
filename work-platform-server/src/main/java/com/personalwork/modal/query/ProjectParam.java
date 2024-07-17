package com.personalwork.modal.query;

import com.personalwork.validation.constraints.ValidDate;
import com.personalwork.enu.ProjectState;
import com.personalwork.validation.ValidGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/2/24
 */
@Data
public class ProjectParam {
    private Integer id;
    @NotNull
    @NotBlank
    private String name;
    @ValidDate(groups = ValidGroup.ProjectCreateValidGroup.class ,message = "开始日期不能为空")
    @NotNull
    private String startDate;
    @ValidDate(groups = ValidGroup.ProjectCreateValidGroup.class ,message = "结束日期不能为空")
    @NotNull
    private String endDate;
    private String closeDate;
    @NotNull(message = "类型不能为空")
    private Integer type;
    private Double progress;
    @NotNull (message = "状态不能为空")
    private ProjectState state;
    @NotNull (message = "重要程度不能为空")
    private Integer important;
    @NotNull(message = "不限定日期区间不能为空")
    private Integer isStartDateOnly;
}

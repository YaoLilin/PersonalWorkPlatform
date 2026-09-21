package com.personalwork.domain.query;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * <p>清单新增或修改参数。</p>
 */
@Data
public class ChecklistParam {
    @NotBlank(message = "清单名称不能为空")
    private String name;
    private Integer projectId;
    private Integer checklistTypeId;
}

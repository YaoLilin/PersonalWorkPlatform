package com.personalwork.domain.query;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * <p>清单完成状态修改参数。</p>
 */
@Data
public class ChecklistStateParam {
    @NotNull(message = "清单完成状态不能为空")
    @Min(value = 0, message = "清单完成状态只能为0或1")
    @Max(value = 1, message = "清单完成状态只能为0或1")
    private Integer isDone;
}

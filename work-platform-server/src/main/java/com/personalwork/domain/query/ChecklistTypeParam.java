package com.personalwork.domain.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * <p>清单类型新增或修改参数。</p>
 */
@Data
public class ChecklistTypeParam {
    private Integer id;
    @NotBlank(message = "名称不能为空")
    private String name;
    private Integer parentId;
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "类型颜色必须为 HEX 格式")
    private String color;
}

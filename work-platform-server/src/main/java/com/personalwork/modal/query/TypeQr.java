package com.personalwork.modal.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc 类型Query模型
 * @date 2024/3/2
 */
@Data
public class TypeQr {
    private Integer id;
    @NotNull(message = "名称不能为空")
    @NotBlank(message = "名称不能为空")
    private String name;
    private Integer parentId;
}

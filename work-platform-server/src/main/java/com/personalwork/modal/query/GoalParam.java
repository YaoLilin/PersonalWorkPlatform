package com.personalwork.modal.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc “目标”参数
 * @date 2024/5/4
 */
@Data
public class GoalParam {
    @NotNull(message = "项目id不能为空")
    private Integer projectId;
    @NotNull(message = "内容不能为空")
    @NotBlank(message = "内容不能为空")
    private String content;
    private Integer isDone;
    private Integer userId;
}

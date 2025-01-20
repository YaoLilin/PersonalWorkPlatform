package com.personalwork.modal.query;

import com.personalwork.constants.Mark;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc “月记录”参数
 * @date 2024/3/26
 */
@Data
public class MonthFormParam {
    @NotNull
    private Mark mark;
    private String summary;
}

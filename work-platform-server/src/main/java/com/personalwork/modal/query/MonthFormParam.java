package com.personalwork.modal.query;

import com.personalwork.enu.Mark;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/26
 */
@Data
public class MonthFormParam {
    @NotNull
    public Mark mark;
    public String summary;
}

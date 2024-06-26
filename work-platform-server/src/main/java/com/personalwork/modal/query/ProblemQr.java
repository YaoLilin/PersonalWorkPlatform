package com.personalwork.modal.query;

import com.personalwork.enu.ProblemLevel;
import com.personalwork.enu.ProblemState;
import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc 查询问题条件模型
 * @date 2024/3/2
 */
@Data
@ToString
public class ProblemQr {
    private String title;
    private String startDate;
    private String endDate;
    private ProblemState state;
    private ProblemLevel level;

}

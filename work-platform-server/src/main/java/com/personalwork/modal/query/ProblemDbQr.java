package com.personalwork.modal.query;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/5
 */
@Data
public class ProblemDbQr {
    private String title;
    private String date;
    private String startDate;
    private String endDate;
    private Integer state;
    private Integer level;
}

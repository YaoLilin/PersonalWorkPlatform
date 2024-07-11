package com.personalwork.modal.dto;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/9
 */
@Data
public class WeekTimeCountDto {
    private String weekDate;
    private String projectName;
    private String typeName;
    private Integer minutes;
}

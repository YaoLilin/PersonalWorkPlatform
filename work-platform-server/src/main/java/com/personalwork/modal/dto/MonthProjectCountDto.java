package com.personalwork.modal.dto;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/22
 */
@Data
public class MonthProjectCountDto {
    private Integer id;
    private Integer projectId;
    private String projectName;
    private Integer minute;
    private Integer monthId;
}

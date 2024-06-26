package com.personalwork.modal.vo;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/2/20
 */
@Data
public class ProjectVo {
    private Integer id;
    private String name = "";
    private String startDate =null;
    private String endDate =null;
    private String closeDate =null;
    private Integer type;
    private double progress=0;
    private Integer  state;
    private Integer  important;
    private Integer isStartDateOnly;
}

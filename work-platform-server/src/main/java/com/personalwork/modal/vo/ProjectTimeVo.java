package com.personalwork.modal.vo;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc 单次的项目时间
 * @date 2024/3/15
 */
@Data
public class ProjectTimeVo {
    private Integer id;
    private BrowserObject project;
    private String date;
    private String startTime;
    private String endTime;

}

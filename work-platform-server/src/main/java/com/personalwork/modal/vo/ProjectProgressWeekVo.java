package com.personalwork.modal.vo;

import lombok.Data;

/**
 * @author yaolilin
 * @desc  项目的周进展信息
 * @date 2025/1/4
 **/
@Data
public class ProjectProgressWeekVo {
    private Integer projectId;
    private String progress;
    private String projectName;
}

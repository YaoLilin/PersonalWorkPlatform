package com.personalwork.modal.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * @author yaolilin
 * @desc 项目的周进展信息
 * @date 2025/1/4
 **/
@Data
@TableName("project_progress_week")
public class ProjectProgressWeekDo {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer weekId;
    private Integer userId;
    private Integer projectId;
    private String progress;
}

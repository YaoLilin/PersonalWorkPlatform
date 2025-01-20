package com.personalwork.modal.vo;

import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc “目标”视图对象
 * @date 2024/5/4
 */
@Data
public class GoalVo {
    private Integer year;
    private List<GoalItem> goals;

    @Data
    public static class GoalItem{
        private Integer id;
        private Integer projectId;
        private String  projectName;
        private String content;
        private Integer isDone;
    }
}

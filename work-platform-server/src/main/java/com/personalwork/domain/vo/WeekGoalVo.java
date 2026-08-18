package com.personalwork.domain.vo;

import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 周目标
 * @date 2024/5/3
 */
@Data
public class WeekGoalVo{
    private String weekDate;
    private List<Item> goals;

    @Data
    public static class Item{
        private Integer id;
        private Integer projectId;
        private String  projectName;
        private String content;
        private Integer isDone;
        private String weekDate;
    }
}

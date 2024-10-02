package com.personalwork.modal.query;

import com.personalwork.validation.constraints.ValidDate;
import com.personalwork.validation.constraints.ValidTime;
import com.personalwork.constants.Mark;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 周记录表单参数
 * @date 2024/3/15
 */
@Data
public class WeekFormParam {
    @ValidDate
    @NotNull
    private String date;
    @NotNull(message = "评价不能为空")
    private Mark mark;
    private String summary;
    @NotNull(message = "projectTimeList 项目列表不能为null")
    private List<ProjectTime> projectTimeList;
    @NotNull(message = "taskCount 任务统计不能为 null")
    private TaskCount taskCount;
    /**
     * 周记录表单创建才会有此参数，表示新增的问题
     */
    private List<Problem> problems;
    /**
     * 周记录表单编辑保存才会有此参数，表示新增的问题
     */
    private List<Problem> addProblems;

    @Data
    public static class ProjectTime{
        @ValidDate
        @NotNull
        private String date;
        @ValidTime(message = "开始时间格式错误")
        private String startTime;
        @ValidTime(message = "结束时间格式错误")
        private String endTime;
        @NotNull(message = "项目id不能为空")
        private Integer project;
    }

    @Data
    public static class TaskCount{
        @NotNull(message = "总时间不能为空")
        @DecimalMin(value = "0",message = "总时间不能小于0")
        private Integer totalMinutes;
        @NotNull(message = "任务统计列表不能为空")
        private List<TaskCountItem> items;
    }

    @Data
    public static class TaskCountItem{
        @NotNull(message = "时间不能为空")
        @DecimalMin(value = "0",message = "时间不能小于0")
        private Integer minutes;
        @NotNull(message = "项目id不能为空")
        private Integer project;
    }

    @Data
    public static class Problem{
        @NotBlank(message = "标题不能为空")
        private String title;
        private String resolve;
        private Integer level;
        @ValidDate(message = "周日期格式错误")
        @NotNull
        private String weekDate;
    }
}

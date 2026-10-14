package com.personalwork.domain.query;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Optional;

/**
 * 日程新增和编辑参数。<br>
 * <p>日程名称独立于项目名称保存；关联清单时，名称将同步为清单名称。</p>
 *
 * @author 姚礼林
 */
@Data
public class ScheduleEventParam {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("H:mm[:ss]");

    /** 新增日程专用校验组；编辑历史无清单日程时不执行此组约束。 */
    public interface Create {
    }

    private Integer projectId;
    private Integer checklistId;
    private Integer checklistTypeId;
    private Boolean createChecklist;
    @NotBlank(message = "日程名称不能为空")
    @Size(max = 255, message = "日程名称不能超过255个字符")
    private String scheduleName;
    @Size(max = 1000, message = "日程描述不能超过1000个字符")
    private String description;
    @NotBlank(message = "开始日期不能为空")
    private String date;
    @NotBlank(message = "结束日期不能为空")
    private String endDate;
    @NotBlank(message = "开始时间不能为空")
    private String startTime;
    @NotBlank(message = "结束时间不能为空")
    private String endTime;

    /**
     * <p>新增日程必须关联已有清单或要求同时新建清单。</p>
     *
     * @return 是否指定了清单来源
     */
    @JsonIgnore
    @AssertTrue(groups = Create.class, message = "日程必须关联已有清单或创建清单")
    public boolean isChecklistSelected() {
        return checklistId != null || Boolean.TRUE.equals(createChecklist);
    }

    /**
     * <p>检查日期及时间的实际合法性；缺失字段交由各字段的 NotBlank 约束提示。</p>
     *
     * @return 非空日期时间是否可以解析
     */
    @JsonIgnore
    @AssertTrue(message = "日程日期或时间格式错误")
    public boolean isTimeFormatValid() {
        boolean missingTime = date == null || date.isBlank() || endDate == null || endDate.isBlank()
                || startTime == null || startTime.isBlank() || endTime == null || endTime.isBlank();
        return missingTime || (parseDateTime(date, startTime).isPresent()
                && parseDateTime(endDate, endTime).isPresent());
    }

    /**
     * <p>检查跨字段的时间先后关系，格式错误由格式约束单独提示。</p>
     *
     * @return 格式有效时，结束时间是否晚于开始时间
     */
    @JsonIgnore
    @AssertTrue(message = "结束时间必须晚于开始时间")
    public boolean isTimeRangeValid() {
        Optional<LocalDateTime> start = parseDateTime(date, startTime);
        Optional<LocalDateTime> end = parseDateTime(endDate, endTime);
        return start.isEmpty() || end.isEmpty() || end.get().isAfter(start.get());
    }

    private Optional<LocalDateTime> parseDateTime(String dateValue, String timeValue) {
        if (dateValue == null || timeValue == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(LocalDateTime.of(LocalDate.parse(dateValue), LocalTime.parse(timeValue, TIME_FORMATTER)));
        } catch (DateTimeParseException exception) {
            // 解析失败转为校验不通过，由 Validation 生成格式错误提示。
            return Optional.empty();
        }
    }
}

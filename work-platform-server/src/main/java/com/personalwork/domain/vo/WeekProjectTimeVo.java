package com.personalwork.domain.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/8
 */
@Data
public class WeekProjectTimeVo {
    private String projectName;
    @JsonProperty("isChecklist")
    private Boolean checklist;
    private Integer minutes;
    private Double hours;
    private String percent;
}

package com.personalwork.modal.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/22
 */
@Data
@ToString
public class MonthProjectCountDo {
    private Integer id;
    private Integer projectId;
    private Integer minute;
    private Integer monthId;
}

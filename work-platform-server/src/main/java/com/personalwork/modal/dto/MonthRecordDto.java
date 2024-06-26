package com.personalwork.modal.dto;


import com.personalwork.modal.entity.RecordMonthDo;
import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/22
 */
@Data
public class MonthRecordDto {
    private RecordMonthDo recordMonthDo;
    private List<MonthProjectCountDto> projectCountList;
}

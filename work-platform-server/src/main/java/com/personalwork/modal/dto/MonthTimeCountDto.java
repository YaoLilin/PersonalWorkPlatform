package com.personalwork.modal.dto;


import com.personalwork.modal.entity.RecordMonthDo;

import java.util.List;

/**
 * 月份时间统计dto
 */
public record MonthTimeCountDto (RecordMonthDo month, List<ProjectTimeCountDto> items){
}

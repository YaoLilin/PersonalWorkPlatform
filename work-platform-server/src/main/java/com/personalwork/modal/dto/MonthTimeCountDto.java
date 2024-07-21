package com.personalwork.modal.dto;


import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.RecordMonthDo;
import com.personalwork.modal.entity.TypeDo;
import lombok.Data;

/**
 * 月份时间统计dto
 */
@Data
public class MonthTimeCountDto {
    private RecordMonthDo month;
    private ProjectDo project;
    private TypeDo type;
    private Integer minutes;
}

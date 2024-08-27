package com.personalwork.modal.dto;

import com.personalwork.modal.entity.RecordWeekDo;

import java.util.List;

/**
 * 周工作时间统计
 * @param week 周记录
 * @param items 项目的统计时间
 */
public record WeekTimeCountDto (RecordWeekDo week,List<ProjectTimeCountDto> items){
}

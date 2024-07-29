package com.personalwork.modal.dto;

import com.personalwork.modal.entity.RecordWeekDo;

import java.util.List;

public record WeekTimeCountDto (RecordWeekDo week,List<ProjectTimeCountDto> items){
}

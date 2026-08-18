package com.personalwork.domain.dto;

import com.personalwork.domain.entity.ProjectDo;
import com.personalwork.domain.entity.RecordWeekDo;

/**
 * @author 姚礼林
 * @desc 每周利用时间统计数据
 * @date 2024/7/9
 */
public record ProjectWeekTimeDto( RecordWeekDo week, ProjectDo project, Integer minutes) {
}

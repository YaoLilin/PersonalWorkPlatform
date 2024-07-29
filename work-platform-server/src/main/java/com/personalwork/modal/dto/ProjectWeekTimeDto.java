package com.personalwork.modal.dto;

import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.RecordWeekDo;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/9
 */
public record ProjectWeekTimeDto( RecordWeekDo week, ProjectDo project, Integer minutes) {
}

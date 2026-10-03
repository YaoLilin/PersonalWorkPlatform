package com.personalwork.domain.dto;

/**
 * 单个项目或独立清单的日程时间汇总。<br>
 * <p>关联项目的清单时间归入项目，独立清单以自身编号汇总。</p>
 *
 * @param id 项目或独立清单的编号
 * @param name 项目或独立清单的显示名称
 * @param minutes 汇总时长，单位为分钟
 * @param isChecklist 是否为独立清单
 */
public record TaskTimeDto(Integer id, String name, int minutes, boolean isChecklist) {
}

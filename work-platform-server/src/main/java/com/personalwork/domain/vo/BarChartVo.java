package com.personalwork.domain.vo;

import java.util.List;

/**
 * @author 姚礼林
 * @desc 前端柱状统计图数据
 * @date 2024/7/9
 * @param date 数据项名称
 * @param items 类别数据
 */
public record BarChartVo(String date, List<Item> items) {
    /**
     * 类别数据。<br>
     * <p>项目与独立清单可通过 {@code key} 和 {@code isChecklist} 区分。</p>
     *
     * @param name 显示名称
     * @param value 统计时长，单位为小时
     * @param key 项目或清单的类型与编号；旧调用方可不提供
     * @param isChecklist 是否为独立清单
     */
    public record Item(String name, Double value, String key, Boolean isChecklist){
        /**
         * 创建不带项目或清单标识的类别数据。<br>
         * <p>{@code key} 默认为空，{@code isChecklist} 默认为 {@code false}。</p>
         *
         * @param name 显示名称
         * @param value 统计时长，单位为小时
         */
        public Item(String name, Double value) {
            this(name, value, null, false);
        }
    }
}

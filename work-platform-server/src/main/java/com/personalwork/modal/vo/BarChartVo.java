package com.personalwork.modal.vo;

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
     * 类别数据
     */
    public record Item(String name, Double value){
    }
}

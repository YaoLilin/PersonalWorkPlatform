package com.personalwork.modal.vo;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/9
 */
public record BarChartVo(String date, List<Item> items) {
    public record Item(String name, Double value){
    }
}

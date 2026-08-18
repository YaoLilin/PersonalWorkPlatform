package com.personalwork.domain.vo;

import lombok.Data;

/**
 * @author 姚礼林
 * @desc 饼图统计数据
 * @date 2024/3/26
 */
@Data
public class PieCountVo {
    private String name;
    private Double count;
    private Double percent;
}

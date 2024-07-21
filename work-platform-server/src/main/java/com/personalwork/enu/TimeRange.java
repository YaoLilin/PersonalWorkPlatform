package com.personalwork.enu;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author 姚礼林
 * @desc 时间范围
 * @date 2024/7/9
 */
public enum TimeRange implements EnumValue{
    /**
     * 近4周
     */
    NEALY_FOUR_WEEK(0),
    /**
     * 近12周
     */
    NEALY_TWELVE_WEEK(1),
    /**
     * 近半年
     */
    NEALY_HALF_YEAR(2),
    /**
     * 近6个月
     */
    NEALY_SIX_MONTH(4),
    /**
     * 近12个月
     */
    NEALY_TWELVE_MONTH(5),
    /**
     * 自定义
     */
    CUSTOM(3);

    private Integer value;

    TimeRange(Integer value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public Object getValue() {
        return value;
    }

    @Override
    public EnumValue create(Integer value) {
        return EnumValueUtil.valueOf(this.getClass(), value);
    }
}

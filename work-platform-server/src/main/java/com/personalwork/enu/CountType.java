package com.personalwork.enu;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author 姚礼林
 * @desc 统计纬度
 * @date 2024/7/9
 */
public enum CountType implements EnumValue{
    /**
     * 项目
     */
    PROJECT(0),
    /**
     * 类型
     */
    TYPE(1);

    private Integer value;

    CountType(Integer value) {
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

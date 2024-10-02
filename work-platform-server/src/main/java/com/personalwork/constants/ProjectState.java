package com.personalwork.constants;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/6/23
 */
public enum ProjectState implements EnumValue{
    /**
     * 未开始
     */
    UN_START(0),
    /**
     * 已开始
     */
    STARTED(1),
    /**
     * 结束
     */
    END(2);

    private final Integer value;

    ProjectState(Integer value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public Object getValue() {
        return value;
    }

    @Override
    @JsonCreator
    public ProjectState create(Integer value) {
        return EnumValueUtil.valueOf(this.getClass(),value);
    }
}

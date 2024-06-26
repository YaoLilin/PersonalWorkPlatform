package com.personalwork.enu;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author 姚礼林
 * @desc 周或月记录的评价
 * @date 2024/1/23
 */
public enum Mark implements EnumValue{
    /**
     * 不合格
     */
    UNQUALIFIED(1),
    /**
     * 合格
     */
    QUALIFIED(2),
    /**
     * 优秀
     */
    EXCELLENT(3);

    private final Integer value;

    Mark(Integer value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public Integer getValue() {
        return value;
    }

    @JsonCreator
    public Mark create(Integer value) {
        return EnumValueUtil.valueOf(this.getClass(), value);
    }

}

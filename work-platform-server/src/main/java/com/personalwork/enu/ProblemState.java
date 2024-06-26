package com.personalwork.enu;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author 姚礼林
 * @desc 问题状态
 * @date 2024/6/23
 */
public enum ProblemState implements EnumValue{
    /**
     * 未解决
     */
    UN_RESOLVE(0),
    /**
     * 已解决
     */
    RESOLVED(1);

    private final Integer state;

    ProblemState(Integer state) {
        this.state = state;
    }

    @JsonValue
    public Integer getState() {
        return state;
    }

    @JsonCreator
    public ProblemState create(Integer state) {
        return EnumValueUtil.valueOf(ProblemState.class, state);
    }

    @Override
    public Object getValue() {
        return state;
    }
}

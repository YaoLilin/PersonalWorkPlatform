package com.personalwork.enu;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * @author 姚礼林
 * @desc 问题级别
 * @date 2024/6/23
 */
public enum ProblemLevel implements EnumValue{
    /**
     * 一般
     */
    NORMAL(1),
    /**
     * 重要
     */
    IMPORTANT(2);
    private final Integer level;

    ProblemLevel(Integer level) {
        this.level = level;
    }

    @JsonValue
    public Integer getLevel() {
        return level;
    }

    @Override
    public Object getValue() {
        return level;
    }

    @JsonCreator
    public ProblemLevel create(Integer level){
        return EnumValueUtil.valueOf(this.getClass(), level);
    }

}

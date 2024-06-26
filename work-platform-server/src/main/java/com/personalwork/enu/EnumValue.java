package com.personalwork.enu;

import java.util.Objects;

/**
 * 自定义枚举类型基础接口
 * <p>
 * 用于扫描、序列化、反序列化实际枚举类
 *
 * @author yaolilin
 */
public interface EnumValue {
    /**
     * 序列化
     *
     * @return 不允许返回 null
     */
    Object getValue();

    /**
     * 反序列化实际枚举类
     * @param value 枚举的值
     * @return 枚举实例
     */
    EnumValue create(Integer value);

    /**
     * 反序列化
     *
     * @param enumType 实际枚举类型
     * @param value    当前值
     * @param <T>      枚举类型并且实现 {@link EnumValue} 接口
     * @return 枚举常量
     */
    static <T extends Enum<T> & EnumValue> T valueOf(Class<T> enumType, Object value) {
        if (enumType == null || value == null) {
            return null;
        }

        T[] enumConstants = enumType.getEnumConstants();
        for (T enumConstant : enumConstants) {
            Object enumValue = enumConstant.getValue();
            if (Objects.equals(enumValue, value)
                    || Objects.equals(enumValue.toString(), value.toString())) {
                return enumConstant;
            }
        }

        return null;
    }

}
package com.personalwork.constants;

/**
 * @author 姚礼林
 * @desc 根据枚举中的值获取枚举
 * @date 2024/6/23
 */
public class EnumValueUtil {
    public static <E extends Enum<?> & EnumValue> E valueOf(Class<E> enumClass, Integer value) {
        E[] enumConstants = enumClass.getEnumConstants();
        for (E e : enumConstants) {
            if (e.getValue().equals(value)) {
                return e;
            }
        }
        return null;
    }
}

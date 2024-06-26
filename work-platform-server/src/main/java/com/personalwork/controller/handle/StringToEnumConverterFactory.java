package com.personalwork.controller.handle;

import com.personalwork.enu.EnumValue;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;

/**
 * @author 姚礼林
 * @desc 数字或者字符串类型 到 枚举类型 的转换，用于接口请求中将参数中的数值转换为枚举
 * @date 2024/6/23
 */
public final class StringToEnumConverterFactory implements ConverterFactory<String, EnumValue> {

    @Override
    @SuppressWarnings("unchecked")
    public <T extends EnumValue> Converter<String, T> getConverter(Class<T> targetType) {
        return new StringToEnum(targetType);
    }

    private class StringToEnum<T extends Enum<T> & EnumValue> implements Converter<String, T> {

        private final Class<T> enumType;

        StringToEnum(Class<T> enumType) {
            this.enumType = enumType;
        }

        @Override
        public T convert(String source) {
            source = source.trim();// 去除首尾空白字符
            return source.isEmpty() ? null : EnumValue.valueOf(this.enumType, source);
        }
    }

}
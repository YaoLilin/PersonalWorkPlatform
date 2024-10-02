package com.personalwork.constants;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @author 姚礼林
 * @desc mybatis 枚举类型处理，用于将数据库中的整数值转为枚举
 * @date 2024/6/23
 */
@MappedTypes(EnumValue.class)
public class IntegerEnumValueTypeHandle<T extends Enum<T> & EnumValue> extends BaseTypeHandler<EnumValue> {
    private final Class<T> type;

    public IntegerEnumValueTypeHandle(Class<T> type) {
        if (type == null) {
            throw new IllegalArgumentException("Type argument cannot be null");
        }

        this.type = type;
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, EnumValue parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, (Integer) parameter.getValue());
    }

    @Override
    public EnumValue getNullableResult(ResultSet rs, String columnName) throws SQLException {
        Integer value = rs.getInt(columnName);
        return rs.wasNull() ? null : EnumValueUtil.valueOf(type, value);
    }

    @Override
    public EnumValue getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        Integer value = rs.getInt(columnIndex);
        return rs.wasNull() ? null : EnumValueUtil.valueOf(type, value);
    }

    @Override
    public EnumValue getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        Integer value = cs.getInt(columnIndex);
        return cs.wasNull() ? null : EnumValueUtil.valueOf(type, value);
    }
}

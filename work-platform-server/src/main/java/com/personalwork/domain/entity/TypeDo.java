package com.personalwork.domain.entity;

import lombok.Data;
import lombok.ToString;

import java.util.Objects;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/3/22
 */
@Data
@ToString
public class TypeDo {
    private Integer id;
    private String name;
    private Integer parentId ;
    private Integer userId;

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        TypeDo typeDo = (TypeDo) object;
        return Objects.equals(id, typeDo.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

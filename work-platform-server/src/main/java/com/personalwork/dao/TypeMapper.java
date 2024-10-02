package com.personalwork.dao;

import com.personalwork.modal.entity.TypeDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/3/23
 */
@Repository
@Mapper
public interface TypeMapper {
    List<TypeDo> getTypes(int userId);

    TypeDo getType(Integer id);
    boolean addType(TypeDo type);
    boolean deleteType(int id);
    boolean updateType(TypeDo type);
}

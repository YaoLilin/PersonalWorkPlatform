package com.personalwork.dao;

import com.personalwork.domain.entity.ChecklistTypeDo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <p>清单类型数据访问接口。</p>
 */
@Mapper
@Repository
public interface ChecklistTypeMapper {
    List<ChecklistTypeDo> listByUserId(@Param("userId") Integer userId);
    ChecklistTypeDo getByIdAndUserId(@Param("id") Integer id, @Param("userId") Integer userId);
    boolean insert(ChecklistTypeDo type);
    boolean update(ChecklistTypeDo type);
    boolean deleteByIdAndUserId(@Param("id") Integer id, @Param("userId") Integer userId);
}

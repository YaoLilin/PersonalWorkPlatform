package com.personalwork.dao;

import com.personalwork.domain.dto.ChecklistDto;
import com.personalwork.domain.entity.ChecklistDo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <p>清单数据访问接口。</p>
 */
@Mapper
@Repository
public interface ChecklistMapper {
    List<ChecklistDto> listByUserId(@Param("userId") Integer userId);
    ChecklistDo getByIdAndUserId(@Param("id") Integer id, @Param("userId") Integer userId);
    boolean insert(ChecklistDo checklist);
    boolean update(ChecklistDo checklist);
    boolean updateNameByIdAndUserId(@Param("id") Integer id, @Param("name") String name,
                                    @Param("userId") Integer userId);
    boolean updateState(@Param("id") Integer id, @Param("isDone") Integer isDone, @Param("userId") Integer userId);
    boolean deleteByIdAndUserId(@Param("id") Integer id, @Param("userId") Integer userId);
}

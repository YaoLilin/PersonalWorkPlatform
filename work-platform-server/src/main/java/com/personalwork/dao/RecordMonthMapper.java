package com.personalwork.dao;

import com.personalwork.modal.entity.RecordMonthDo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/22
 */
@Repository
@Mapper
public interface RecordMonthMapper {

    List<RecordMonthDo> list();
    List<RecordMonthDo> listRange(@Param("startYear") Integer startYear, @Param("startMonth") Integer startMonth,
                                  @Param("endYear") Integer endYear, @Param("endMonth") Integer endMonth);

    RecordMonthDo getById(Integer id);

    boolean insert(RecordMonthDo recordMonth);

    RecordMonthDo getByDate(@Param("year") Integer year,@Param("month") Integer month);

    boolean update(RecordMonthDo recordMonth);


}

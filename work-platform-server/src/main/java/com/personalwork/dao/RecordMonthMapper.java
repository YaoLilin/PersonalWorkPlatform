package com.personalwork.dao;

import com.personalwork.modal.entity.RecordMonthDo;
import org.apache.ibatis.annotations.Mapper;
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

    RecordMonthDo getById(int id);

    boolean insert(RecordMonthDo recordMonth);

    RecordMonthDo getByDate(int year,int month);

    boolean update(RecordMonthDo recordMonth);


}

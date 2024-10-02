package com.personalwork.dao;

import com.personalwork.modal.entity.RecordWeekDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/6/18
 */
@Repository
@Mapper
public interface RecordWeekMapper {
    RecordWeekDo getWorkWeekByDate(String  date,Integer userId);
    RecordWeekDo getWorkWeekById(Integer  id);
    List<RecordWeekDo> getWorkWeekByYear(int year);
    List<RecordWeekDo> getWorkWeekList(Integer userId);

    boolean addWorkWeek(RecordWeekDo recordWeekDo);
    boolean deleteWorkWeek(Integer  id);
    boolean updateWorkWeek(RecordWeekDo recordWeekDo);
}

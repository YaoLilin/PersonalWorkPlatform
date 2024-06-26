package com.personalwork.dao;

import com.personalwork.modal.entity.MonthProjectCountDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/22
 */
@Mapper
@Repository
public interface MonthProjectCountMapper {
    boolean deleteByMonth(Integer monthId);
    boolean delete(Integer monthId);

    boolean deleteByProjectId(Integer projectId);
    List<MonthProjectCountDo> list(Integer monthId);

    List<MonthProjectCountDo> listByProjectId(Integer projectId);
    boolean update(MonthProjectCountDo count);

    boolean insert(MonthProjectCountDo count);
}

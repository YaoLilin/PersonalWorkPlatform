package com.personalwork.dao;

import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.query.ProblemQr;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/11
 */
@Repository
@Mapper
public interface ProblemMapper {
    List<ProblemDo> getProblems(ProblemQr problemQr);

    List<ProblemDo> getProblemsByWeekDate(String weekDate,Integer userId);
    List<ProblemDo> getProblemsExceptThisWeek(Integer weekId,Integer userId);
    ProblemDo getProblemById(int id);
    boolean add(ProblemDo problemDo);
    boolean update(ProblemDo problemDo);
    boolean delete(int id);
    ProblemDo getOpenProblemByName(String name,Integer userId);
    boolean done(int id);
    boolean callback(int id);

}

package com.personalwork.dao;

import com.personalwork.enu.ProblemLevel;
import com.personalwork.enu.ProblemState;
import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.query.ProblemQr;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/1
 */
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProblemMapperTest {
    @Autowired
    private ProblemMapper problemMapper;

    @Test
    void getProblems() {
        ProblemQr problemQr = new ProblemQr();
        problemQr.setTitle("问题1");
        assertTrue(problemMapper.getProblems(problemQr).size() > 0);
        ProblemQr problemQr2 = new ProblemQr();
        problemQr.setLevel(ProblemLevel.NORMAL);
        assertTrue(problemMapper.getProblems(problemQr2).size() > 0);
        ProblemQr problemQr3 = new ProblemQr();
        problemQr3.setState(ProblemState.UN_RESOLVE);
        assertTrue(problemMapper.getProblems(problemQr3).size() > 0);
        ProblemQr problemQr4 = new ProblemQr();
        problemQr4.setStartDate("2024-03-04");
        problemQr4.setEndDate("2024-04-04");
        assertEquals(11, problemMapper.getProblems(problemQr4).size());
    }

    @Test
    void getProblemsByWeekDate() {
        assertEquals(10, problemMapper.getProblemsByWeekDate("2024-03-04").size());
    }

    @Test
    void getProblemsExceptThisWeek() {
        assertTrue(problemMapper.getProblemsExceptThisWeek(9).size() > 0);
    }

    @Test
    void getProblemById() {
        assertEquals("问题1", problemMapper.getProblemById(58).getTitle());
    }

    @Test
    void add() {
        ProblemDo problemDo = new ProblemDo();
        problemDo.setState(ProblemState.UN_RESOLVE);
        problemDo.setTitle("test");
        problemDo.setLevel(ProblemLevel.NORMAL);
        problemDo.setResolve("test");
        problemDo.setWeekDate("2024-03-04");
        assertTrue(problemMapper.add(problemDo));
    }

    @Test
    void update() {
        ProblemDo problemDo = new ProblemDo();
        problemDo.setState(ProblemState.UN_RESOLVE);
        problemDo.setTitle("test");
        problemDo.setLevel(ProblemLevel.NORMAL);
        problemDo.setResolve("test");
        problemDo.setWeekDate("2024-03-04");
        problemDo.setId(58);
        assertTrue(problemMapper.update(problemDo));
    }

    @Test
    void delete() {
        assertTrue(problemMapper.delete(58));
    }

    @Test
    void getOpenProblemByName() {
        assertEquals("问题1", problemMapper.getOpenProblemByName("问题1").getTitle());
    }

    @Test
    void done() {
        assertTrue(problemMapper.done(58));
    }

    @Test
    void callback() {
        assertTrue(problemMapper.callback(58));
    }
}
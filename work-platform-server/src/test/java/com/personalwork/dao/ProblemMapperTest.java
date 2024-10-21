package com.personalwork.dao;

import com.personalwork.constants.ProblemLevel;
import com.personalwork.constants.ProblemState;
import com.personalwork.modal.entity.ProblemDo;
import com.personalwork.modal.query.ProblemQr;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @author 姚礼林
 * @desc 问题持久层测试类
 * @date 2024/7/1
 */
@ActiveProfiles("test")
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProblemMapperTest {
    @Autowired
    private ProblemMapper problemMapper;

    @Test
    void getProblems() {
        ProblemQr problemQr = new ProblemQr();
        problemQr.setTitle("冥想不够");
        problemQr.setUserId(1);
        assertTrue(problemMapper.getProblems(problemQr).size() > 0);
        ProblemQr problemQr2 = new ProblemQr();
        problemQr2.setLevel(ProblemLevel.NORMAL);
        problemQr2.setUserId(1);
        assertTrue(problemMapper.getProblems(problemQr2).size() > 0);
        ProblemQr problemQr3 = new ProblemQr();
        problemQr3.setState(ProblemState.UN_RESOLVE);
        problemQr3.setUserId(1);
        assertTrue(problemMapper.getProblems(problemQr3).size() > 0);
        ProblemQr problemQr4 = new ProblemQr();
        problemQr4.setStartDate("2024-08-01");
        problemQr4.setEndDate("2024-08-31");
        problemQr4.setUserId(1);
        assertEquals(5, problemMapper.getProblems(problemQr4).size());
    }

    @Test
    void getProblemsByWeekDate() {
        assertFalse( problemMapper.getProblemsByWeekDate("2024-08-05",1).isEmpty());
    }

    @Test
    void getProblemsExceptThisWeek() {
        assertFalse(problemMapper.getProblemsExceptThisWeek(9, 1).isEmpty());
    }


    @Test
    void add() {
        ProblemDo problemDo = new ProblemDo();
        problemDo.setState(ProblemState.UN_RESOLVE);
        problemDo.setTitle("test");
        problemDo.setLevel(ProblemLevel.NORMAL);
        problemDo.setResolve("test");
        problemDo.setWeekDate("2024-03-04");
        problemDo.setUserId(1);
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
        problemDo.setId(83);
        problemDo.setUserId(1);
        assertTrue(problemMapper.update(problemDo));
    }

    @Test
    void delete() {
        assertTrue(problemMapper.delete(83));
    }

    @Test
    void getOpenProblemByName() {
        assertEquals("冥想不够", problemMapper.getOpenProblemByName("冥想不够",1).getTitle());
    }

    @Test
    void done() {
        assertTrue(problemMapper.done(83));
    }

    @Test
    void callback() {
        assertTrue(problemMapper.callback(83));
    }
}

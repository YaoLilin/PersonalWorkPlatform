package com.personalwork.dao;

import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.query.MonthGoalParam;
import com.personalwork.modal.query.MonthGoalQueryParam;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/1
 */
@ActiveProfiles("test")
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MonthGoalMapperTest {
    @Autowired
    private MonthGoalMapper monthGoalMapper;

    @Test
    void testList() {
        MonthGoalQueryParam param = new MonthGoalQueryParam();
        param.setMonth(10);
        param.setYear(2024);
        param.setUserId(1);
        List<? extends GoalDo> list = monthGoalMapper.list(param);
        System.out.println("size:" + list.size());
        assertTrue(list.size() > 0);
    }

    @Test
    void testInsert() {
        MonthGoalParam goalParam = new MonthGoalParam();
        goalParam.setYear(2024);
        goalParam.setMonth(5);
        goalParam.setIsDone(0);
        goalParam.setProjectId(1);
        goalParam.setUserId(1);
        goalParam.setContent("test");
        assertTrue(monthGoalMapper.insert(goalParam));
    }

    @Test
    void testChangeState() {
        assertTrue(monthGoalMapper.changeState(8, 1));
    }

    @Test
    void testDelete() {
        assertTrue(monthGoalMapper.delete(8));
    }
}

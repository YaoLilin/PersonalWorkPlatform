package com.personalwork.dao;

import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.query.WeekGoalParam;
import com.personalwork.modal.query.WeekGoalQueryParam;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author 姚礼林
 * @desc 周目标持久层测试
 * @date 2024/7/1
 */
@ActiveProfiles("test")
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class WeekGoalMapperTest {

    @Autowired
    private WeekGoalMapper weekGoalMapper;

    @Test
     void testList() {
        WeekGoalQueryParam param = new WeekGoalQueryParam();
        param.setWeekNumber(41);
        param.setYear(2024);
        param.setUserId(1);
        List<? extends GoalDo> list = weekGoalMapper.list(param);
        System.out.println("size:"+list.size());
        assertTrue(list.size() > 0);
    }

    @Test
    void testInsert() {
        WeekGoalParam goalParam = new WeekGoalParam();
        goalParam.setYear(2024);
        goalParam.setWeekNumber(18);
        goalParam.setIsDone(0);
        goalParam.setProjectId(1);
        goalParam.setContent("test");
        goalParam.setUserId(1);
        assertTrue(weekGoalMapper.insert(goalParam));
    }

    @Test
     void testChangeState() {
        assertTrue(weekGoalMapper.changeState(24,1));
    }

    @Test
     void testDelete() {
        assertTrue(weekGoalMapper.delete(24));
    }
}

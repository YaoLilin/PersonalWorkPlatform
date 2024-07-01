package com.personalwork.dao;

import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.query.MonthGoalParam;
import com.personalwork.modal.query.MonthGoalQueryParam;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/1
 */
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class MonthGoalMapperTest {
    @Autowired
    private MonthGoalMapper monthGoalMapper;

    @Test
    public void testList() {
        MonthGoalQueryParam param = new MonthGoalQueryParam();
        param.setMonth(5);
        param.setYear(2024);
        List<? extends GoalDo> list = monthGoalMapper.list(param);
        System.out.println("size:"+list.size());
        assertTrue(list.size() > 0);
    }

    @Test
    public void testInsert() {
        MonthGoalParam goalParam = new MonthGoalParam();
        goalParam.setYear(2024);
        goalParam.setMonth(5);
        goalParam.setIsDone(0);
        goalParam.setProjectId(1);
        goalParam.setContent("test");
        assertTrue(monthGoalMapper.insert(goalParam));
    }

    @Test
    public void testChangeState() {
        assertTrue(monthGoalMapper.changeState(1,1));
    }

    @Test
    public void testDelete() {
        assertTrue(monthGoalMapper.delete(1));
    }
}

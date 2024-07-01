package com.personalwork.dao;

import com.personalwork.modal.entity.GoalDo;
import com.personalwork.modal.query.WeekGoalParam;
import com.personalwork.modal.query.WeekGoalQueryParam;
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
public class WeekGoalMapperTest {

    @Autowired
    private WeekGoalMapper weekGoalMapper;

    @Test
    public void testList() {
        WeekGoalQueryParam param = new WeekGoalQueryParam();
        param.setWeekNumber(18);
        param.setYear(2024);
        List<? extends GoalDo> list = weekGoalMapper.list(param);
        System.out.println("size:"+list.size());
        assertTrue(list.size() > 0);
    }

    @Test
    public void testInsert() {
        WeekGoalParam goalParam = new WeekGoalParam();
        goalParam.setYear(2024);
        goalParam.setWeekNumber(18);
        goalParam.setIsDone(0);
        goalParam.setProjectId(1);
        goalParam.setContent("test");
        assertTrue(weekGoalMapper.insert(goalParam));
    }

    @Test
    public void testChangeState() {
        assertTrue(weekGoalMapper.changeState(7,1));
    }

    @Test
    public void testDelete() {
        assertTrue(weekGoalMapper.delete(7));
    }
}

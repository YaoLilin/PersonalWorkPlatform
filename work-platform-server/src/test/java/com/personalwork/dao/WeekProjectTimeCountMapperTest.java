package com.personalwork.dao;

import com.personalwork.modal.entity.WeekProjectTimeCountDo;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @author 姚礼林
 * @desc 周项目时间统计持久层测试
 * @date 2024/7/2
 */
@ActiveProfiles("test")
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class WeekProjectTimeCountMapperTest {
    @Autowired
    private WeekProjectTimeCountMapper mapper;

    @Test
    void listByWeekId() {
        assertTrue(mapper.listByWeekId(10).size()>0);
    }

    @Test
    void listByProjectId() {
        assertTrue(mapper.listByProjectId(13).size()>0);
    }

    @Test
    void add() {
        WeekProjectTimeCountDo  countDo = new WeekProjectTimeCountDo();
        countDo.setProject(1);
        countDo.setMinutes(100);
        countDo.setWeekId(1);
        assertTrue(mapper.add(countDo));
    }

    @Test
    void deleteByWeek() {
        assertTrue(mapper.deleteByWeek(10));
    }

    @Test
    void deleteByProjectId() {
        assertTrue(mapper.deleteByProjectId(13));
    }
}

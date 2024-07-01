package com.personalwork.dao;

import com.personalwork.modal.entity.MonthProjectCountDo;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/1
 */
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class MonthProjectCountMapperTest {
    @Autowired
    private MonthProjectCountMapper monthProjectCountMapper;

    @Test
    void deleteByMonth() {
        assertTrue(monthProjectCountMapper.deleteByMonth(5));
    }

    @Test
    void delete() {
        assertTrue(monthProjectCountMapper.delete(7));
    }

    @Test
    void deleteByProjectId() {
        assertTrue(monthProjectCountMapper.deleteByProjectId(12));
    }

    @Test
    void list() {
        assertTrue(monthProjectCountMapper.list(5).size() > 0);
    }

    @Test
    void listByProjectId() {
        assertTrue(monthProjectCountMapper.listByProjectId(12).size() > 0);
    }

    @Test
    void update() {
        MonthProjectCountDo count = new MonthProjectCountDo();
        count.setMinute(20);
        count.setProjectId(2);
        count.setMonthId(1);
        count.setId(7);
        assertTrue(monthProjectCountMapper.update(count));
    }

    @Test
    void insert() {
        MonthProjectCountDo count = new MonthProjectCountDo();
        count.setMinute(20);
        count.setProjectId(2);
        count.setMonthId(1);
        assertTrue(monthProjectCountMapper.insert(count));
    }
}
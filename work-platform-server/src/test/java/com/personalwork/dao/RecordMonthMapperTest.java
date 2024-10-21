package com.personalwork.dao;

import com.personalwork.constants.Mark;
import com.personalwork.modal.entity.RecordMonthDo;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @author 姚礼林
 * @desc 月记录持久层测试
 * @date 2024/7/2
 */
@ActiveProfiles("test")
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class RecordMonthMapperTest {
    @Autowired
    private RecordMonthMapper recordMonthMapper;

    @Test
    void list() {
        assertTrue(recordMonthMapper.list(1).size()>0);
    }

    @Test
    void getById() {
        assertNotNull(recordMonthMapper.getById(1));
    }

    @Test
    void insert() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setWorkTime(200);
        recordMonthDo.setMonth(4);
        recordMonthDo.setYear(2024);
        recordMonthDo.setSummary("test");
        recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setIsSummarize(1);
        recordMonthDo.setUserId(1);
        assertTrue(recordMonthMapper.insert(recordMonthDo));
    }

    @Test
    void getByDate() {
        assertNotNull(recordMonthMapper.getByDate(2024,4,1));
    }

    @Test
    void update() {
        RecordMonthDo recordMonthDo = new RecordMonthDo();
        recordMonthDo.setWorkTime(200);
        recordMonthDo.setMonth(4);
        recordMonthDo.setYear(2024);
        recordMonthDo.setSummary("test");
        recordMonthDo.setMark(Mark.UNQUALIFIED);
        recordMonthDo.setIsSummarize(1);
        recordMonthDo.setId(1);
        assertTrue(recordMonthMapper.update(recordMonthDo));
    }
}

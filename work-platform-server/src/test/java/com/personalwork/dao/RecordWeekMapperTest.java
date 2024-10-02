package com.personalwork.dao;

import com.personalwork.constants.Mark;
import com.personalwork.modal.entity.RecordWeekDo;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/2
 */
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class RecordWeekMapperTest {
    @Autowired
    private RecordWeekMapper mapper;

    @Test
    void getWorkWeekByDate() {
        assertNotNull(mapper.getWorkWeekByDate("2024-03-04",1));
    }

    @Test
    void getWorkWeekById() {
        assertNotNull(mapper.getWorkWeekById(9));
    }

    @Test
    void getWorkWeekByYear() {
        // no sql
    }

    @Test
    void getWorkWeekList() {
        assertTrue(mapper.getWorkWeekList(1).size()>0);
    }

    @Test
    void addWorkWeek() {
        RecordWeekDo recordWeekDo = new RecordWeekDo();
        recordWeekDo.setTime(200);
        recordWeekDo.setDate("2024-03-04");
        recordWeekDo.setMark(Mark.UNQUALIFIED);
        recordWeekDo.setSummary("test");
        assertTrue(mapper.addWorkWeek(recordWeekDo));
    }

    @Test
    void deleteWorkWeek() {
        assertTrue(mapper.deleteWorkWeek(9));
    }

    @Test
    void updateWorkWeek() {
        RecordWeekDo recordWeekDo = new RecordWeekDo();
        recordWeekDo.setTime(200);
        recordWeekDo.setDate("2024-03-04");
        recordWeekDo.setMark(Mark.UNQUALIFIED);
        recordWeekDo.setSummary("test");
        recordWeekDo.setId(9);
        assertTrue(mapper.updateWorkWeek(recordWeekDo));
    }
}

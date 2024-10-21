package com.personalwork.dao;

import com.personalwork.modal.entity.TypeDo;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * @author 姚礼林
 * @desc 类型持久层测试
 * @date 2024/7/2
 */
@ActiveProfiles("test")
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TypeMapperTest {
    @Autowired
    private TypeMapper typeMapper;

    @Test
    void getTypes() {
        assertFalse(typeMapper.getTypes(1).isEmpty());
    }

    @Test
    void getType() {
        assertNotNull(typeMapper.getType(1));
    }

    @Test
    void addType() {
        TypeDo typeDo = new TypeDo();
        typeDo.setParentId(1);
        typeDo.setName("test");
        typeDo.setUserId(1);
        assertTrue(typeMapper.addType(typeDo));
    }

    @Test
    void deleteType() {
        assertTrue(typeMapper.deleteType(1));
    }

    @Test
    void updateType() {
        TypeDo typeDo = new TypeDo();
        typeDo.setParentId(2);
        typeDo.setName("test");
        typeDo.setId(1);
        assertTrue(typeMapper.updateType(typeDo));
    }
}

package com.personalwork.dao;

import com.personalwork.constants.ProjectState;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author 姚礼林
 * @desc 项目持久层测试
 * @date 2024/7/1
 */
@ActiveProfiles("test")
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProjectMapperTest {
    @Autowired
    private ProjectMapper projectMapper;

    @Test
    void listByUser() {
        assertTrue(projectMapper.listByUser(1).size() > 0);
    }

    @Test
    void getProject() {
        assertNotNull(projectMapper.getProject(12));
    }

    @Test
    void addProject() {
        ProjectDo projectDo = new ProjectDo();
        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        projectDo.setType(typeDo);
        projectDo.setName("test");
        projectDo.setImportant(0);
        projectDo.setIsStartDateOnly(1);
        projectDo.setStartDate("2024-01-01");
        projectDo.setState(ProjectState.STARTED);
        projectDo.setUserId(1);
        assertTrue(projectMapper.addProject(projectDo));
    }

    @Test
    void updateProject() {
        ProjectDo projectDo = new ProjectDo();
        TypeDo typeDo = new TypeDo();
        typeDo.setId(1);
        projectDo.setType(typeDo);
        projectDo.setName("test");
        projectDo.setImportant(0);
        projectDo.setIsStartDateOnly(0);
        projectDo.setStartDate("2024-01-01");
        projectDo.setEndDate("2024-12-01");
        projectDo.setState(ProjectState.STARTED);
        projectDo.setCloseDate("2024-12-01");
        projectDo.setProgress(10.0);
        projectDo.setId(12);
        assertTrue(projectMapper.updateProject(projectDo));
    }

    @Test
    void deleteProject() {
        assertTrue(projectMapper.deleteProject(12));
    }
}

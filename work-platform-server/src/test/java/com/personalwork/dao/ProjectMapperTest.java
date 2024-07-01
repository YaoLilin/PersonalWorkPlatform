package com.personalwork.dao;

import com.personalwork.enu.ProjectState;
import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/1
 */
@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProjectMapperTest {
    @Autowired
    private ProjectMapper projectMapper;

    @Test
    void getAll() {
        assertTrue(projectMapper.getAll().size() > 0);
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
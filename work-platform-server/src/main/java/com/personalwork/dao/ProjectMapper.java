package com.personalwork.dao;

import com.personalwork.modal.entity.ProjectDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/3/22
 */
@Repository
@Mapper
public interface ProjectMapper {
    List<ProjectDo> getAll();
    ProjectDo getProject(int id);
    boolean addProject(ProjectDo project);

    boolean updateProject(ProjectDo project);

    boolean deleteProject(int id);
}

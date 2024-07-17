package com.personalwork.controller;

import com.alibaba.fastjson.JSONObject;
import com.personalwork.modal.dto.ProjectDto;
import com.personalwork.modal.query.ProjectParam;
import com.personalwork.service.ProjectService;
import com.personalwork.validation.ValidGroup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/3/14
 */
@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectDto> getProjects() {
        return projectService.getAll();
    }

    @GetMapping("/{id}")
    public ProjectDto getProject(@PathVariable Integer id) {
       return projectService.getProject(id);
    }

    @GetMapping("/{id}/exist-record")
    public String existRecord(@PathVariable Integer id) {
        JSONObject result = new JSONObject();
        result.put("result", projectService.existRecord(id));
        return result.toJSONString();
    }

    @PostMapping
    public boolean addProject(@RequestBody @Validated(ValidGroup.ProjectCreateValidGroup.class) ProjectParam projectParam) {
        return projectService.addProject(projectParam);
    }

    @PutMapping("/{id}")
    public boolean updateProject(@RequestBody @Validated(ValidGroup.ProjectUpdateValidGroup.class) ProjectParam projectParam) {
        return projectService.updateProject(projectParam);
    }

    @DeleteMapping("/{ids}")
    public boolean deleteProject(@PathVariable String  ids) {
        if (ids == null || "".equals(ids)) {
            return true;
        }
        ArrayList<Integer> idList = new ArrayList<>();
        String[] idStr = ids.split(",");
        for (String id : idStr) {
            idList.add(Integer.parseInt(id));
        }
        return projectService.deleteProject(idList);
    }
}

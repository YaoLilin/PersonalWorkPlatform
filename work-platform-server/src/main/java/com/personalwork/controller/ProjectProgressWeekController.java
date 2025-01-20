package com.personalwork.controller;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.personalwork.modal.entity.ProjectProgressWeekDo;
import com.personalwork.modal.query.ProjectProgressWeekParam;
import com.personalwork.modal.vo.ProjectProgressWeekVo;
import com.personalwork.service.ProjectProgressWeekService;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author yaolilin
 * @desc 周项目进展信息接口
 * @date 2025/1/4
 **/
@RestController
@RequestMapping("/project-progress-week")
public class ProjectProgressWeekController {
    private final ProjectProgressWeekService projectProgressWeekService;

    @Autowired
    public ProjectProgressWeekController(ProjectProgressWeekService projectProgressWeekService) {
        this.projectProgressWeekService = projectProgressWeekService;
    }

    @PostMapping
    public boolean insert(@RequestBody ProjectProgressWeekParam param) {
        ProjectProgressWeekDo projectProgressWeekDo = new ProjectProgressWeekDo();
        BeanUtils.copyProperties(param, projectProgressWeekDo);
        projectProgressWeekDo.setUserId(UserUtil.getLoginUserId());
        return projectProgressWeekService.save(projectProgressWeekDo);
    }

    @GetMapping("/{weekId}")
    public List<ProjectProgressWeekVo> get(@PathVariable Integer weekId) {
        List<ProjectProgressWeekDo> list = projectProgressWeekService.list(weekId);
        return list.stream().map(o -> BeanUtil.copyProperties(o, ProjectProgressWeekVo.class)).toList();
    }

    @PutMapping("/{id}")
    public boolean update(@PathVariable Integer id,
                          @RequestBody ProjectProgressWeekParam param) {
        ProjectProgressWeekDo projectProgressWeekDo = new ProjectProgressWeekDo();
        BeanUtils.copyProperties(param, projectProgressWeekDo);
        projectProgressWeekDo.setUserId(UserUtil.getLoginUserId());
        projectProgressWeekDo.setId(id);
        return projectProgressWeekService.updateById(projectProgressWeekDo);
    }

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Integer id) {
        return projectProgressWeekService.remove(
                new QueryWrapper<ProjectProgressWeekDo>()
                        .eq("id", id)
                        .eq("user_id", UserUtil.getLoginUserId())
        );
    }
}

package com.personalwork.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.personalwork.dao.ProjectProgressWeekMapper;
import com.personalwork.modal.entity.ProjectProgressWeekDo;
import com.personalwork.util.UserUtil;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author yaolilin
 * @desc 周项目进展信息业务类
 * @date 2025/1/4
 **/
@Service
public class ProjectProgressWeekService extends ServiceImpl<ProjectProgressWeekMapper, ProjectProgressWeekDo>  {

    public List<ProjectProgressWeekDo> list(int weekId) {
       return super.list(
                new LambdaQueryWrapper<ProjectProgressWeekDo>()
                        .eq(ProjectProgressWeekDo::getWeekId, weekId)
                        .eq(ProjectProgressWeekDo::getUserId, UserUtil.getLoginUserId())
        );
    }
}

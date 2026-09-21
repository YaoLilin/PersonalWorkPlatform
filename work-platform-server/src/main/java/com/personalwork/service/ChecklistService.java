package com.personalwork.service;

import com.personalwork.dao.ChecklistMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.domain.dto.ChecklistDto;
import com.personalwork.domain.entity.ChecklistDo;
import com.personalwork.domain.query.ChecklistParam;
import com.personalwork.exception.DbOperateException;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>清单管理服务。</p>
 */
@Service
@RequiredArgsConstructor
public class ChecklistService {
    private final ChecklistMapper checklistMapper;
    private final ProjectTimeMapper projectTimeMapper;

    /**
     * <p>获取当前用户的全部清单。</p>
     *
     * @return 清单列表
     */
    public List<ChecklistDto> list() {
        return checklistMapper.listByUserId(UserUtil.getLoginUserId());
    }

    /**
     * <p>新增清单。</p>
     *
     * @param param 清单参数
     * @return 新增清单编号
     */
    public Integer add(ChecklistParam param) {
        ChecklistDo checklist = toChecklist(param);
        checklist.setIsDone(0);
        if (!checklistMapper.insert(checklist)) {
            throw new DbOperateException("新增清单失败");
        }
        return checklist.getId();
    }

    /**
     * <p>更新清单名称、关联项目和类型。</p>
     *
     * @param id 清单编号
     * @param param 清单参数
     */
    public void update(Integer id, ChecklistParam param) {
        ChecklistDo checklist = toChecklist(param);
        checklist.setId(id);
        if (!checklistMapper.update(checklist)) {
            throw new MethodParamInvalidException("清单不存在或无权限修改");
        }
        projectTimeMapper.updateScheduleNameByChecklistId(id, checklist.getName());
    }

    /**
     * <p>更新清单完成状态。</p>
     *
     * @param id 清单编号
     * @param isDone 完成状态，0:未完成 1:已完成
     */
    public void updateState(Integer id, Integer isDone) {
        if (!Integer.valueOf(0).equals(isDone) && !Integer.valueOf(1).equals(isDone)) {
            throw new MethodParamInvalidException("清单完成状态只能为0或1");
        }
        if (!checklistMapper.updateState(id, isDone, UserUtil.getLoginUserId())) {
            throw new MethodParamInvalidException("清单不存在或无权限修改");
        }
    }

    /**
     * <p>删除清单。</p>
     *
     * @param id 清单编号
     */
    public void delete(Integer id) {
        if (checklistMapper.getByIdAndUserId(id, UserUtil.getLoginUserId()) == null) {
            throw new MethodParamInvalidException("清单不存在或无权限删除");
        }
        projectTimeMapper.clearChecklistIdByChecklistId(id);
        if (!checklistMapper.deleteByIdAndUserId(id, UserUtil.getLoginUserId())) {
            throw new MethodParamInvalidException("清单不存在或无权限删除");
        }
    }

    private ChecklistDo toChecklist(ChecklistParam param) {
        ChecklistDo checklist = new ChecklistDo();
        BeanUtils.copyProperties(param, checklist);
        checklist.setUserId(UserUtil.getLoginUserId());
        return checklist;
    }
}

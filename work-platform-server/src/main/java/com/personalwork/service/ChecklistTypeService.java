package com.personalwork.service;

import com.personalwork.dao.ChecklistTypeMapper;
import com.personalwork.domain.dto.TypeTreeNode;
import com.personalwork.domain.entity.ChecklistTypeDo;
import com.personalwork.domain.query.ChecklistTypeParam;
import com.personalwork.exception.DbOperateException;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.util.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * <p>清单类型管理服务。</p>
 */
@Service
@RequiredArgsConstructor
public class ChecklistTypeService {
    private final ChecklistTypeMapper checklistTypeMapper;

    /**
     * <p>获取当前用户的清单类型树。</p>
     *
     * @return 清单类型树
     */
    public List<TypeTreeNode> getTypeTree() {
        List<ChecklistTypeDo> types = checklistTypeMapper.listByUserId(UserUtil.getLoginUserId());
        return buildTree(null, types);
    }

    /**
     * <p>新增清单类型。</p>
     *
     * @param param 清单类型参数
     * @return 新增类型编号
     */
    public Integer addType(ChecklistTypeParam param) {
        ChecklistTypeDo type = new ChecklistTypeDo();
        BeanUtils.copyProperties(param, type);
        type.setUserId(UserUtil.getLoginUserId());
        if (!checklistTypeMapper.insert(type)) {
            throw new DbOperateException("新增清单类型失败");
        }
        return type.getId();
    }

    /**
     * <p>更新清单类型。</p>
     *
     * @param id 类型编号
     * @param param 清单类型参数
     */
    public void updateType(Integer id, ChecklistTypeParam param) {
        ChecklistTypeDo type = new ChecklistTypeDo();
        BeanUtils.copyProperties(param, type);
        type.setId(id);
        type.setUserId(UserUtil.getLoginUserId());
        if (!checklistTypeMapper.update(type)) {
            throw new MethodParamInvalidException("清单类型不存在或无权限修改");
        }
    }

    /**
     * <p>删除清单类型。</p>
     *
     * @param id 类型编号
     */
    public void deleteType(Integer id) {
        if (!checklistTypeMapper.deleteByIdAndUserId(id, UserUtil.getLoginUserId())) {
            throw new MethodParamInvalidException("清单类型不存在或无权限删除");
        }
    }

    private List<TypeTreeNode> buildTree(Integer parentId, List<ChecklistTypeDo> types) {
        List<TypeTreeNode> nodes = new ArrayList<>();
        for (ChecklistTypeDo type : types) {
            if (java.util.Objects.equals(parentId, type.getParentId())) {
                TypeTreeNode node = new TypeTreeNode();
                node.setKey(type.getId());
                node.setValue(type.getId());
                node.setTitle(type.getName());
                node.setColor(type.getColor());
                node.setChildren(buildTree(type.getId(), types));
                nodes.add(node);
            }
        }
        return nodes;
    }
}

package com.personalwork.service;

import com.personalwork.dao.TypeMapper;
import com.personalwork.modal.dto.TypeTreeNode;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.query.TypeQr;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.UserUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * @author 姚礼林
 * @desc 项目类型业务类
 * @date 2023/3/23
 */
@Service
public class TypeService {
    private final TypeMapper mapper;

    @Autowired
    public TypeService(TypeMapper mapper) {
        this.mapper = mapper;
    }

    public List<TypeDo> getTypes() {
        UserDetail loginUser = Objects.requireNonNull(UserUtil.getLoginUser());
        return mapper.getTypes(loginUser.getId());
    }

    public boolean addType(TypeQr type) {
        UserDetail loginUser = Objects.requireNonNull(UserUtil.getLoginUser());
        TypeDo typeDo = new TypeDo();
        BeanUtils.copyProperties(type, typeDo);
        typeDo.setUserId(loginUser.getId());
        return mapper.addType(typeDo);
    }

    public boolean deleteType(List<Integer> ids) {
        for (int id : ids) {
            mapper.deleteType(id);
        }
        return true;
    }

    public boolean updateType(TypeQr typeQr) {
        TypeDo type = new TypeDo();
        BeanUtils.copyProperties(typeQr,type);
        return mapper.updateType(type);
    }

    /**
     * 获取项目类型，以树形式展示
     * @return 类型树
     */
    public List<TypeTreeNode> getTypeTree() {
        UserDetail loginUser = Objects.requireNonNull(UserUtil.getLoginUser());
        List<TypeDo> typeList = mapper.getTypes(loginUser.getId());
        List<TypeTreeNode> parentNodes = new ArrayList<>();
        for (TypeDo item :typeList){
            if (item.getParentId() == null){
                TypeTreeNode node = new TypeTreeNode();
                node.setValue(item.getId());
                node.setKey(item.getId());
                node.setTitle(item.getName());
                node.setChildren(getChildrenNode(item.getId(),typeList));
                parentNodes.add(node);
            }
        }
        return parentNodes;
    }

    private List<TypeTreeNode> getChildrenNode(int parentId, List<TypeDo> typeList){
        List<TypeTreeNode> result = new ArrayList<>();
        for (TypeDo item :typeList) {
            if (item.getParentId() != null && item.getParentId() == parentId){
                TypeTreeNode node = new TypeTreeNode();
                node.setValue(item.getId());
                node.setKey(item.getId());
                node.setTitle(item.getName());
                node.setChildren(getChildrenNode(item.getId(),typeList));
                result.add(node);
            }
        }
        return result;
    }

}

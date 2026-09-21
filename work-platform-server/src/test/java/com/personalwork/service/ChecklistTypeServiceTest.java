package com.personalwork.service;

import com.personalwork.dao.ChecklistTypeMapper;
import com.personalwork.domain.dto.TypeTreeNode;
import com.personalwork.domain.entity.ChecklistTypeDo;
import com.personalwork.security.bean.UserDetail;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * <p>清单类型服务单元测试。</p>
 */
class ChecklistTypeServiceTest {

    /**
     * <p>清理测试用户上下文。</p>
     */
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    /**
     * <p>类型树应将子类型挂载到对应父类型下。</p>
     */
    @Test
    void getTypeTreeShouldNestChildrenUnderParent() {
        UserDetail user = new UserDetail("admin", "admin", "", "", 1);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user, null));
        ChecklistTypeDo parent = new ChecklistTypeDo();
        parent.setId(1);
        parent.setName("工作");
        ChecklistTypeDo child = new ChecklistTypeDo();
        child.setId(2);
        child.setName("开发");
        child.setParentId(1);
        ChecklistTypeService service = new ChecklistTypeService(new InMemoryChecklistTypeMapper(List.of(parent, child)));

        List<TypeTreeNode> result = service.getTypeTree();

        assertEquals(1, result.size());
        assertEquals("开发", result.get(0).getChildren().get(0).getTitle());
    }

    /**
     * <p>用于构建清单类型树的内存 Mapper。</p>
     */
    private record InMemoryChecklistTypeMapper(List<ChecklistTypeDo> types) implements ChecklistTypeMapper {
        @Override
        public List<ChecklistTypeDo> listByUserId(Integer userId) {
            return types;
        }

        @Override
        public ChecklistTypeDo getByIdAndUserId(Integer id, Integer userId) {
            return null;
        }

        @Override
        public boolean insert(ChecklistTypeDo type) {
            return false;
        }

        @Override
        public boolean update(ChecklistTypeDo type) {
            return false;
        }

        @Override
        public boolean deleteByIdAndUserId(Integer id, Integer userId) {
            return false;
        }
    }
}

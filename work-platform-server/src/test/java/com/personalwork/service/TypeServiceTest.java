package com.personalwork.service;

import com.personalwork.dao.TypeMapper;
import com.personalwork.modal.dto.TypeTreeNode;
import com.personalwork.modal.entity.TypeDo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TypeServiceTest {

    @Mock
    private TypeMapper mapper;

    @InjectMocks
    private TypeService typeService;

    @BeforeEach
    public void setUp() {
    }

    @Test
    public void testGetTypeTree() {
        TypeDo type1 = new TypeDo();
        type1.setId(1);
        type1.setName("学习");
        TypeDo type2 = new TypeDo();
        type2.setId(2);
        type2.setName("锻炼");
        TypeDo type3 = new TypeDo();
        type3.setId(3);
        type3.setName("java");
        type3.setParentId(1);
        TypeDo type4 = new TypeDo();
        type4.setId(4);
        type4.setName("骑行");
        type4.setParentId(2);

        TypeTreeNode treeNode1 = buildTypeTree(1, "学习");
        TypeTreeNode treeNode2 = buildTypeTree(2, "锻炼");
        TypeTreeNode treeNode3 = buildTypeTree(3, "java");
        TypeTreeNode treeNode4 = buildTypeTree(4, "骑行");
        treeNode1.setChildren(Stream.of(treeNode3).toList());
        treeNode2.setChildren(Stream.of(treeNode4).toList());
        treeNode3.setChildren(new ArrayList<>());
        treeNode4.setChildren(new ArrayList<>());
        List<TypeTreeNode> expectedTree = Arrays.asList(treeNode1, treeNode2);

        when(mapper.getTypes(anyInt())).thenReturn(Stream.of(type1, type2, type3, type4).toList());
        List<TypeTreeNode> typeTree = typeService.getTypeTree();
        assertEquals(expectedTree, typeTree);
    }

    @Test
    public void testGetTypeTree2_withOnlyParent() {
        TypeDo type1 = new TypeDo();
        type1.setId(1);
        type1.setName("学习");
        TypeDo type2 = new TypeDo();
        type2.setId(2);
        type2.setName("锻炼");

        TypeTreeNode treeNode1 = buildTypeTree(1, "学习");
        TypeTreeNode treeNode2 = buildTypeTree(2, "锻炼");
        treeNode1.setChildren(new ArrayList<>());
        treeNode2.setChildren(new ArrayList<>());
        List<TypeTreeNode> expectedTree = Arrays.asList(treeNode1, treeNode2);

        when(mapper.getTypes(anyInt())).thenReturn(Stream.of(type1, type2).toList());
        List<TypeTreeNode> typeTree = typeService.getTypeTree();
        assertEquals(expectedTree, typeTree);
    }

    @Test
    public void testGetTypeTree2_withNoneType() {
        when(mapper.getTypes(anyInt())).thenReturn(new ArrayList<>());
        List<TypeTreeNode> typeTree = typeService.getTypeTree();
        assertEquals(new ArrayList<>(), typeTree);
    }

    private  TypeTreeNode buildTypeTree(int key, String name) {
        TypeTreeNode treeNode = new TypeTreeNode();
        treeNode.setKey(key);
        treeNode.setValue(key);
        treeNode.setTitle(name);
        return treeNode;
    }

    // 注意：此处省略了testGetTypeTree的实现，因为其逻辑较为复杂且需要根据具体实现细节调整。
    // 但基本思路是类似的，即使用Mockito设置预期行为，然后调用实际方法并验证结果。
}

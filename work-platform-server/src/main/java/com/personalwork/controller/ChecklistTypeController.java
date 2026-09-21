package com.personalwork.controller;

import com.personalwork.domain.dto.TypeTreeNode;
import com.personalwork.domain.query.ChecklistTypeParam;
import com.personalwork.service.ChecklistTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * <p>清单类型接口。</p>
 */
@RestController
@RequestMapping("/checklist-types")
@RequiredArgsConstructor
public class ChecklistTypeController {
    private final ChecklistTypeService checklistTypeService;

    /**
     * <p>获取清单类型树。</p>
     *
     * @return 清单类型树
     */
    @GetMapping("/tree")
    public List<TypeTreeNode> getTypeTree() {
        return checklistTypeService.getTypeTree();
    }

    /**
     * <p>新增清单类型。</p>
     *
     * @param param 清单类型参数
     * @return 新增类型编号
     */
    @PostMapping
    public Integer addType(@RequestBody @Valid ChecklistTypeParam param) {
        return checklistTypeService.addType(param);
    }

    /**
     * <p>修改清单类型。</p>
     *
     * @param id 类型编号
     * @param param 清单类型参数
     */
    @PutMapping("/{id}")
    public void updateType(@PathVariable Integer id, @RequestBody @Valid ChecklistTypeParam param) {
        checklistTypeService.updateType(id, param);
    }

    /**
     * <p>删除清单类型。</p>
     *
     * @param id 类型编号
     */
    @DeleteMapping("/{id}")
    public void deleteType(@PathVariable Integer id) {
        checklistTypeService.deleteType(id);
    }
}

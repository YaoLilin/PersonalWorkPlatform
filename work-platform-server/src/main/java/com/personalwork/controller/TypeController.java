package com.personalwork.controller;

import com.personalwork.modal.dto.TypeTreeNode;
import com.personalwork.modal.query.TypeQr;
import com.personalwork.service.TypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author 姚礼林
 * @desc 项目类型
 * @date 2024/2/18
 */
@RestController
@RequestMapping("/types")
public class TypeController {

    @Autowired
    private TypeService typeService;

    @GetMapping("/tree")
    public List<TypeTreeNode> getTypeTree() {
        return typeService.getTypeTree();
    }

    @PostMapping
    public boolean addType(@RequestBody @Validated TypeQr typeQr) {
        return typeService.addType(typeQr);
    }

    @DeleteMapping("/{ids}")
    public boolean deleteType(@PathVariable String ids) {
        List<Integer> idList = Arrays.stream(ids.split(",")).map(Integer::parseInt).collect(Collectors.toList());
        return typeService.deleteType(idList);
    }

    @PutMapping("/{id}")
    public boolean updateType(@RequestBody @Validated TypeQr typeQr) {
        return typeService.updateType(typeQr);
    }
}

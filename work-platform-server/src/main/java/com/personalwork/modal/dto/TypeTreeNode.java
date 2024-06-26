package com.personalwork.modal.dto;

import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/2/18
 */
@Data
public class TypeTreeNode {
    private Integer key;
    private Integer value;
    private String title;
    private List<TypeTreeNode> children;
}

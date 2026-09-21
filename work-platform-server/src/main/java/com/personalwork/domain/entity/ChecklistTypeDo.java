package com.personalwork.domain.entity;

import lombok.Data;

/**
 * <p>清单类型实体。</p>
 * <p>字段结构与项目类型一致，类型归属到当前用户。</p>
 */
@Data
public class ChecklistTypeDo {
    private Integer id;
    private String name;
    private Integer parentId;
    private String color;
    private Integer userId;
}

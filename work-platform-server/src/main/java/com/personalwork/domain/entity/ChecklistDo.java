package com.personalwork.domain.entity;

import lombok.Data;

/**
 * <p>清单实体。</p>
 * <p>一个清单可关联项目，并且归属于一个清单类型。</p>
 */
@Data
public class ChecklistDo {
    private Integer id;
    private String name;
    private Integer projectId;
    private Integer isDone;
    private Integer checklistTypeId;
    private Integer userId;
}

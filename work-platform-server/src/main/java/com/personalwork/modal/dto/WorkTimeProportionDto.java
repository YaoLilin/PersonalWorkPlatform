package com.personalwork.modal.dto;

import com.personalwork.modal.entity.ProjectDo;
import com.personalwork.modal.entity.TypeDo;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author yaolilin
 */
@Data
@AllArgsConstructor
public class WorkTimeProportionDto {
    private ProjectDo project;
    private TypeDo type;
    private Integer minutes;
}

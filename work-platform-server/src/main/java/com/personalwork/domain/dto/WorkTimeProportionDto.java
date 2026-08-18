package com.personalwork.domain.dto;

import com.personalwork.domain.entity.ProjectDo;
import com.personalwork.domain.entity.TypeDo;
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

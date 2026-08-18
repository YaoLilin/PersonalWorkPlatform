package com.personalwork.domain.dto;

import com.personalwork.domain.entity.ProjectDo;

public record ProjectTimeCountDto(ProjectDo project, Integer minutes) {
}

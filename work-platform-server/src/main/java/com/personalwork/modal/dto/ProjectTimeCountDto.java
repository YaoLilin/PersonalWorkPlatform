package com.personalwork.modal.dto;

import com.personalwork.modal.entity.ProjectDo;

public record ProjectTimeCountDto(ProjectDo project, Integer minutes) {
}

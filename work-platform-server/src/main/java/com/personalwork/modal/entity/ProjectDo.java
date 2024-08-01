package com.personalwork.modal.entity;

import com.personalwork.enu.ProjectState;
import lombok.Data;
import lombok.ToString;

import java.util.Objects;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/3/22
 */
@Data
@ToString
public class ProjectDo {
    private Integer id;
    private String name;
    private String startDate;
    private String endDate;
    private String closeDate;
    private TypeDo type;
    private Double progress;
    private ProjectState state;
    private Integer important;
    private Integer isStartDateOnly;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectDo projectDo = (ProjectDo) o;
        return Objects.equals(id, projectDo.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

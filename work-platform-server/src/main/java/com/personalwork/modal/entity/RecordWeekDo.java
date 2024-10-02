package com.personalwork.modal.entity;

import com.personalwork.constants.Mark;
import lombok.Data;
import lombok.ToString;

import java.util.Objects;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/6/18
 */
@Data
@ToString
public class RecordWeekDo {
    private Integer id;
    private String  date;
    private Integer time;
    private String summary;
    private Mark mark;
    private Integer userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecordWeekDo that = (RecordWeekDo) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

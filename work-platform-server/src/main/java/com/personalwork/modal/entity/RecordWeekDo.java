package com.personalwork.modal.entity;

import com.personalwork.enu.Mark;
import lombok.Data;
import lombok.ToString;

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
}

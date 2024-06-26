package com.personalwork.modal.vo;

import com.personalwork.enu.Mark;
import lombok.Data;

import java.util.List;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/8
 */
@Data
public class WeeksVo {
    private Integer id;
    private Mark mark;
    private Double hours;
    private String summary;
    private List<WeekProjectTimeVo> projectTime;
    private String  date;
}

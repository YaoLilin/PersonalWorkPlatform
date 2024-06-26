package com.personalwork.modal.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2023/3/22
 */
@Data
@ToString
public class TypeDo {
    private Integer id;
    private String name;
    private Integer parentId ;
}

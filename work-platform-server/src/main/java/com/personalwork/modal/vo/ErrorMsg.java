package com.personalwork.modal.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author 姚礼林
 * @desc 向前端输出的错误模型，用于提示接口错误
 * @date 2024/2/12
 */
@Data
@AllArgsConstructor
public class ErrorMsg {
    private String message;
    private String type;
}

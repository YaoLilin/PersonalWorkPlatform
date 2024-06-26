package com.personalwork.exception;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/22
 */
public class MonthCountException extends ServiceException{
    public MonthCountException(String msg) {
        super(msg);
    }

    public MonthCountException(String msg,Exception cause) {
        super(msg,cause);
    }
}

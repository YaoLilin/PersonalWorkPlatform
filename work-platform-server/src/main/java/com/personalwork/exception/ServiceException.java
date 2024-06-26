package com.personalwork.exception;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/22
 */
public class ServiceException extends RuntimeException{
    public ServiceException(String msg){
        super(msg);
    }

    public ServiceException(String msg,Exception cause){
        super(msg,cause);
    }
}

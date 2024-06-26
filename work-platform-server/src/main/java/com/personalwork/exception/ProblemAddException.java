package com.personalwork.exception;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/18
 */
public class ProblemAddException extends ServiceException{
    public ProblemAddException(String msg){
        super(msg);
    }

    public ProblemAddException(String msg,Exception cause) {
        super(msg,cause);
    }
}

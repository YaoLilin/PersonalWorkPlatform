package com.personalwork.exception;

/**
 * @author yaolilin
 * @desc 数据库操作错误
 * @date 2025/1/11
 **/
public class DbOperateException extends RuntimeException{
    public DbOperateException(String message) {
        super(message);
    }
}

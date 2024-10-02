package com.personalwork.exception;

/**
 * @author yaolilin
 * @desc todo
 * @date 2024/9/25
 **/
public class UserRegisterException extends RuntimeException {
    public UserRegisterException() {
    }

    public UserRegisterException(String message) {
        super(message);
    }

    public UserRegisterException(String message, Throwable cause) {
        super(message, cause);
    }
}

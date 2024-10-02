package com.personalwork.constants;

public enum LoginResultType {
    /**
     * 用户名或密码错误
     */
    USER_OR_PASSWORD_ERROR(1),
    /**
     * 登录成功
     */
    SUCCESS(3);

    private int code;

    LoginResultType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}

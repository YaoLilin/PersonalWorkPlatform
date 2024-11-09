package com.personalwork.security.bean;

import lombok.Data;

/**
 * @author yaolilin
 * @desc 存入 redis 的 user 对象
 * @date 2024/11/5
 **/
@Data
public class AuthUser {
    private String loginName;
    private String name;
    private Integer id;
}

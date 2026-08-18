package com.personalwork.domain.entity;

import lombok.Data;

import java.io.Serializable;

/**
 * @author yaolilin
 */
@Data
public class UserDo implements Serializable {
    private String loginName;
    private String name;
    private String email;
    private String password;
    private Integer id;
}

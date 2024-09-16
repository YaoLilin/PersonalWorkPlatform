package com.personalwork.modal.vo;

import com.personalwork.enu.LoginResultType;
import lombok.Data;

/**
 * @author yaolilin
 * @desc 用户登陆返回对象
 * @date 2024/8/31
 **/
@Data
public class LoginResultVo {
    private LoginResultType type;
    private String token;
    private UserVo user;
}

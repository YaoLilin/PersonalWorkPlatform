package com.personalwork.modal.query;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * @author yaolilin
 * @desc todo
 * @date 2024/9/25
 **/
@Data
public class RegisterParam {
    @NotNull(message = "登陆名不能为空") @NotBlank(message = "登陆名不能为空")
    private String loginName;
    @NotNull(message = "用户名不能为空") @NotBlank(message = "用户名不能为空")
    private String name;
    @Email(message = "邮箱格式不对")
    private String email;
    @NotNull(message = "密码不能为空") @NotBlank(message = "密码不能为空")
    private String password;
}

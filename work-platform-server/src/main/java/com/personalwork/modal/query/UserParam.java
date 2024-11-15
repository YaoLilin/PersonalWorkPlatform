package com.personalwork.modal.query;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserParam{
    @NotNull(message = "登陆名不能为空") @NotBlank(message = "登陆名不能为空")
    private String loginName;
    @Email(message = "邮箱格式不对")
    private String email;
    @NotNull(message = "密码不能为空") @NotBlank(message = "密码不能为空")
    private String password;
    Integer id;
}

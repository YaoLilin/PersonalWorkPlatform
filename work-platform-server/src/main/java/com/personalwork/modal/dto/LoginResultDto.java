package com.personalwork.modal.dto;

import com.personalwork.constants.LoginResultType;
import com.personalwork.security.bean.UserDetail;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResultDto {
    private LoginResultType type;
    private String token;
    private UserDetail user;
}

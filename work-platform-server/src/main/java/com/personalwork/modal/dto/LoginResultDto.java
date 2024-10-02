package com.personalwork.modal.dto;

import com.personalwork.constants.LoginResultType;
import com.personalwork.modal.entity.UserDo;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResultDto {
    private LoginResultType type;
    private String token;
    private UserDo user;
}

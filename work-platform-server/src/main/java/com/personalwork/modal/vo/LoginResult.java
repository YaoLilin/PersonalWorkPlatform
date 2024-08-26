package com.personalwork.modal.vo;

import com.personalwork.enu.LoginResultType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResult {
    private LoginResultType type;
    private String token;
}

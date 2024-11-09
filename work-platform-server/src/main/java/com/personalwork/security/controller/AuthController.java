package com.personalwork.security.controller;

import com.personalwork.anotations.NoAuthRequired;
import com.personalwork.constants.LoginResultType;
import com.personalwork.modal.query.RegisterParam;
import com.personalwork.modal.query.UserParam;
import com.personalwork.modal.dto.LoginResultDto;
import com.personalwork.modal.vo.LoginResultVo;
import com.personalwork.modal.vo.UserVo;
import com.personalwork.security.service.AuthService;
import com.personalwork.util.RSAUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @NoAuthRequired
    @GetMapping(value = "/rsa/public-key")
    public String getPublicKey(){
        return RSAUtils.generateBase64PublicKey();
    }

    @NoAuthRequired
    @PostMapping("/login")
    public ResponseEntity<LoginResultVo> login(@Validated @RequestBody UserParam param, HttpServletRequest request) {
        LoginResultDto resultDto = authService.login(param);
        LoginResultVo result = getLoginResultVo(resultDto);
        if (resultDto.getType() != LoginResultType.SUCCESS) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @NoAuthRequired
    @PostMapping("/register")
    public ResponseEntity<LoginResultVo> register(@Validated @RequestBody RegisterParam param,HttpServletRequest request) {
        LoginResultDto resultDto = authService.register(param);
        LoginResultVo result = getLoginResultVo(resultDto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public void logout() {
        authService.logout();
    }

    private LoginResultVo getLoginResultVo(LoginResultDto resultDto) {
        LoginResultVo result = new LoginResultVo();
        result.setToken(resultDto.getToken());
        result.setType(resultDto.getType());
        if (resultDto.getUser() != null) {
            UserVo userVo = new UserVo();
            BeanUtils.copyProperties(resultDto.getUser(), userVo);
            result.setUser(userVo);
        }
        return result;
    }

}

package com.personalwork.security.controller;

import com.personalwork.enu.LoginResultType;
import com.personalwork.modal.query.UserParam;
import com.personalwork.modal.vo.LoginResult;
import com.personalwork.security.service.AuthService;
import com.personalwork.util.RSAUtils;
import jakarta.servlet.http.HttpServletRequest;
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


    @GetMapping(value = "/rsa/public-key")
    public @ResponseBody String getPublicKey(){
        return RSAUtils.generateBase64PublicKey();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResult> login(@Validated @RequestBody UserParam param, HttpServletRequest request) {
        LoginResult login = authService.login(param,request);
        if (login.getType() != LoginResultType.SUCCESS) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(login);
        }
        return ResponseEntity.ok(login);
    }

}

package com.personalwork.controller;

import com.personalwork.modal.query.UserParam;
import com.personalwork.service.UserService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")

public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public boolean insertUser(@RequestBody @Validated UserParam body) {
        return userService.insertUser(body);
    }

}

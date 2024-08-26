package com.personalwork.service;

import com.personalwork.dao.UserMapper;
import com.personalwork.modal.query.UserParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserMapper userMapper;

    @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public boolean insertUser(UserParam param) {

        return true;
    }

}

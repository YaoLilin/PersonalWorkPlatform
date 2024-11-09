package com.personalwork.security.service;

import com.personalwork.dao.UserMapper;
import com.personalwork.modal.entity.UserDo;
import com.personalwork.security.bean.UserDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * @author yaolilin
 * @desc 用户认证时从数据库获取用户信息
 * @date 2024/8/17
 **/
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserMapper mapper;

    @Autowired
    public UserDetailsServiceImpl(UserMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public UserDetails loadUserByUsername(String loginName) throws UsernameNotFoundException {
        UserDo userDo = mapper.getByLoginName(loginName);
        if (userDo == null) {
            throw new UsernameNotFoundException("用户名不存在！");
        }
        return new UserDetail(userDo.getLoginName(), userDo.getName(), userDo.getEmail()
                , userDo.getPassword(), userDo.getId());
    }
}

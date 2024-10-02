package com.personalwork.security.bean;

import com.personalwork.modal.entity.UserDo;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * @author yaolilin
 * @desc 认证存储用户信息和权限
 * @date 2024/8/17
 **/
@Data
@AllArgsConstructor
public class UserDetail implements UserDetails {
    private final UserDo user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getName();
    }

    @Override
    public boolean isAccountNonExpired() {
        // 是否没有过期
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // 是否没有过期
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

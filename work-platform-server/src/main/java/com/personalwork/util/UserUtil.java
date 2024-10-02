package com.personalwork.util;

import com.personalwork.security.bean.UserDetail;
import jakarta.annotation.Nullable;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Objects;

/**
 * @author yaolilin
 * @desc 用户工具类
 * @date 2024/9/26
 **/
public class UserUtil {
    private UserUtil() {
    }

    /**
     * 获取当前登录用户
     * @return 用户信息
     */
    @Nullable
    public static UserDetail getLoginUser() {
        Object user = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (user == null) {
            return null;
        }
        return (UserDetail) user;
    }

    public static Integer getLoginUserId() {
        return Objects.requireNonNull(getLoginUser()).getUser().getId();
    }
}

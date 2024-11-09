package com.personalwork.base;

import com.personalwork.modal.entity.UserDo;
import com.personalwork.security.bean.UserDetail;
import com.personalwork.util.UserUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import static org.mockito.Mockito.when;

/**
 * @author yaolilin
 * @desc 测试类通用的初始化
 * @date 2024/10/17
 **/
public class TestSetUp {

    @BeforeEach
    public void before(){
        MockitoAnnotations.openMocks(this);
        Mockito.mockStatic(UserUtil.class);
        when(UserUtil.getLoginUserId()).thenReturn(1);
        UserDo userDo = new UserDo();
        userDo.setId(1);
        UserDetail userDetail = new UserDetail("admin","admin","123@163.com","123",1);
        when(UserUtil.getLoginUser()).thenReturn(userDetail);
    }

    @AfterEach
    public void after(){
        Mockito.framework().clearInlineMocks();
    }
}

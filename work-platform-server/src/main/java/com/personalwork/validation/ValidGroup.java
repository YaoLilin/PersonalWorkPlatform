package com.personalwork.validation;


import jakarta.validation.groups.Default;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/6/23
 */
public interface ValidGroup{
    interface ProjectCreateValidGroup extends Default {}
    interface ProjectUpdateValidGroup extends Default {}
}

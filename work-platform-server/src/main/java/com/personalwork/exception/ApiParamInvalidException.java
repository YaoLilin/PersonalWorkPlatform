package com.personalwork.exception;

/**
 * <p>接口请求参数未满足业务约束时抛出的异常，消息可直接向调用方展示。</p>
 *
 * @author 姚礼林
 * @date 2026/10/14
 */
public class ApiParamInvalidException extends RuntimeException {
    /**
     * <p>使用可公开的参数校验原因创建异常。</p>
     *
     * @param message 调用方可据此修正参数的提示
     */
    public ApiParamInvalidException(String message) {
        super(message);
    }
}

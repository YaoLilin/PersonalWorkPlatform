package com.personalwork.controller.handle;

import com.personalwork.domain.vo.ErrorMsg;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.ObjectError;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * <p>全局异常响应测试。</p>
 */
class ControllerExceptionHandlerTest {
    private final ControllerExceptionHandler handler = new ControllerExceptionHandler();

    @Test
    void internalErrorDoesNotExposeExceptionMessage() {
        ResponseEntity<ErrorMsg> response = handler.handleException(
                new IllegalStateException("数据库连接详情"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("服务器发生内部错误", response.getBody().getMessage());
    }

    @Test
    void validationErrorKeepsParameterMessage() {
        BindException validationError = new BindException(new Object(), "request");
        validationError.addError(new ObjectError("request", "参数不合法"));
        ResponseEntity<ErrorMsg> response = handler.handleValidatedException(validationError);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("[request] 参数不合法", response.getBody().getMessage());
    }
}

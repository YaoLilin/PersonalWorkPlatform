package com.personalwork.controller.handle;

import com.personalwork.domain.vo.ErrorMsg;
import com.personalwork.exception.ApiParamInvalidException;
import com.personalwork.exception.MethodParamInvalidException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.BindException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * <p>全局异常响应测试。</p>
 *
 * @author 姚礼林
 * @date 2026/10/12
 */
class ControllerExceptionHandlerTest {
    private final ControllerExceptionHandler handler = new ControllerExceptionHandler();

    @Test
    void apiParameterErrorsAreRoutedToBadRequestHandler() throws Exception {
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new ParameterController())
                .setControllerAdvice(handler).build();

        mvc.perform(get("/api-param"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("结束时间必须晚于开始时间"))
                .andExpect(jsonPath("$.type").value("ApiParamInvalidException"));
    }

    @Test
    void ordinaryMethodParameterErrorsKeepInternalDetailsHidden() throws Exception {
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new ParameterController())
                .setControllerAdvice(handler).build();

        mvc.perform(get("/method-param"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("服务器发生内部错误"));
    }

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
    /**
     * <p>验证异常类型到 HTTP 响应的实际路由。</p>
     *
     * @author 姚礼林
     * @date 2026/10/14
     */
    @RestController
    static class ParameterController {
        /** <p>模拟接口业务参数校验失败。</p> */
        @GetMapping("/api-param")
        public void apiParameter() {
            throw new ApiParamInvalidException("结束时间必须晚于开始时间");
        }

        /** <p>模拟内部方法的参数错误。</p> */
        @GetMapping("/method-param")
        public void methodParameter() {
            throw new MethodParamInvalidException("内部方法参数详情");
        }
    }
}

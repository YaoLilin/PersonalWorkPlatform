package com.personalwork.controller.handle;

import com.personalwork.domain.vo.ErrorMsg;
import com.personalwork.exception.ApiParamInvalidException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.stream.Collectors;


/**
 * @author 姚礼林
 * @desc 全局controller异常处理
 * @date 2024/2/15
 */
@ControllerAdvice
@ResponseBody
@Log4j2
public class ControllerExceptionHandler {

    /**
     * <p>记录未处理异常，并返回不包含内部异常详情的统一错误消息。</p>
     *
     * @param e 接口异常
     * @return 内部错误响应
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorMsg> handleException(Exception e) {
        log.error("接口发生异常：{}", e.getMessage(), e);
        return new ResponseEntity<>(new ErrorMsg("服务器发生内部错误", e.getClass().getSimpleName()), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * <p>返回接口业务参数的校验原因，供调用方修正请求。</p>
     *
     * @param exception 接口参数异常
     * @return 包含具体提示的 HTTP 400 响应
     */
    @ExceptionHandler(ApiParamInvalidException.class)
    public ResponseEntity<ErrorMsg> handleApiParamInvalidException(ApiParamInvalidException exception) {
        log.warn("接口参数校验失败：{}", exception.getMessage(), exception);
        return ResponseEntity.badRequest().body(
                new ErrorMsg(exception.getMessage(), exception.getClass().getSimpleName()));
    }

    /**
     * <p>处理接口参数校验异常，保留可供用户修正输入的提示。</p>
     *
     * @param e 参数校验异常
     * @return 参数校验错误响应
     */
    @ExceptionHandler(value = {BindException.class, ConstraintViolationException.class,
            MethodArgumentNotValidException.class})
    public ResponseEntity<ErrorMsg> handleValidatedException(Exception e) {
        ResponseEntity<ErrorMsg> resp = null;
        if (e instanceof MethodArgumentNotValidException ex) {
            // BeanValidation exception
            String msg = ex.getBindingResult().getAllErrors().stream()
                    .map(i -> String.format("[%s] %s",i.getObjectName(),i.getDefaultMessage()))
                    .collect(Collectors.joining("; "));
            resp = new ResponseEntity<>(new ErrorMsg(msg, ex.getClass().getSimpleName()), ex.getStatusCode());
        } else if (e instanceof ConstraintViolationException ex) {
            // BeanValidation GET simple param
            String msg = ex.getConstraintViolations().stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining("; "));
            resp = new ResponseEntity<>(new ErrorMsg(msg, ex.getClass().getSimpleName()), HttpStatus.NOT_FOUND);
        } else if (e instanceof BindException ex) {
            // BeanValidation GET object param
            String msg = ex.getAllErrors().stream()
                    .map(i -> String.format("[%s] %s",i.getObjectName(),i.getDefaultMessage()))
                    .collect(Collectors.joining("; "));
            resp = new ResponseEntity<>(new ErrorMsg(msg, ex.getClass().getSimpleName()), HttpStatus.NOT_FOUND);
        }else {
            resp = new ResponseEntity<>(new ErrorMsg(e.getMessage(), e.getClass().getSimpleName()), HttpStatus.NOT_FOUND);
        }
        if (resp.getBody() != null) {
            log.error("接口发生异常：" + resp.getBody().getMessage(), e);
        }
        return resp;
    }

}

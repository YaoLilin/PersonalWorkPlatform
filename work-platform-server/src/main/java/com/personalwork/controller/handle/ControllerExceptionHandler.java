package com.personalwork.controller.handle;

import com.personalwork.modal.vo.ErrorMsg;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorMsg> handleException(Exception e) {
        log.error("接口发生异常：" + e.getMessage(), e);
        return new ResponseEntity<>(new ErrorMsg(e.getMessage(), e.getClass().getSimpleName()), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * 接口参数校验异常处理
     */
    @ExceptionHandler(value = {BindException.class, ValidationException.class, MethodArgumentNotValidException.class})
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
        }
        if (resp != null && resp.getBody() != null) {
            log.error("接口发生异常：" + resp.getBody().getMessage(), e);
        }
        return resp;
    }

}

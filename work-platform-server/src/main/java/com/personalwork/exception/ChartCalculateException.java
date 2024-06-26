package com.personalwork.exception;

/**
 * @author 姚礼林
 * @desc 统计图计算异常
 * @date 2024/6/15
 */
public class ChartCalculateException extends RuntimeException{
    public ChartCalculateException(String message) {
        super(message);
    }

    public ChartCalculateException(String message, Throwable cause) {
        super(message,cause);
    }

    public static class TypeChartCalculateException extends ChartCalculateException {
        public TypeChartCalculateException(String message) {
            super(message);
        }
        public TypeChartCalculateException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

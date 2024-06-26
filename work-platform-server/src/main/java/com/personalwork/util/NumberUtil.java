package com.personalwork.util;


import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/23
 */
public class NumberUtil {

    /**
     * 四舍五入
     * @param number 浮点值
     * @param places 保留的位数
     * @param isReserveZero 小数位是否保留0
     * @return 结果
     */
    public static String round(double number,int places,boolean isReserveZero){
        BigDecimal r = new BigDecimal(number);
        BigDecimal i = r.setScale(places, RoundingMode.HALF_EVEN);
        if (!isReserveZero){
            // 小数位不保留0
            return i.stripTrailingZeros().toPlainString();
        }else {
            // 小数位保留0
            return i.toPlainString();
        }
    }
}

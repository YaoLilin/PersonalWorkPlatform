package com.personalwork;

import com.personalwork.constants.RegularConstant;
import org.junit.jupiter.api.Test;

import java.text.DecimalFormat;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/3/23
 */
public class SimpleTest {
    @Test
    public void test() {
        DecimalFormat df = new DecimalFormat("0.00");
        System.out.println(df.format((double) 400 / 60));
    }
}

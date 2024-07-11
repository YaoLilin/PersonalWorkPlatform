package com.personalwork.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/7/10
 */
public class DateUtil {
    public static String[] getDateRangeByWeekBaseMonday(String date, int weekNumber) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate dateObj = LocalDate.parse(date, formatter);
        LocalDate endOfWeek = dateObj.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate startOfWeek = endOfWeek.minusWeeks(weekNumber);
        return new String[]{startOfWeek.format(formatter), endOfWeek.format(formatter)};
    }

    public static String getNowDate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate dateObj = LocalDate.now();
        return dateObj.format(formatter);
    }
}

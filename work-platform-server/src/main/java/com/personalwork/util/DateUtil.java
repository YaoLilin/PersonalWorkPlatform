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
    private static final DateTimeFormatter  FORMATTER =  DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static String[] getDateRangeByWeekBaseMonday(int weekNumber) {
        LocalDate nowDate = LocalDate.now();
        LocalDate endOfWeek = nowDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate startOfWeek = endOfWeek.minusWeeks(weekNumber);
        return new String[]{startOfWeek.format(FORMATTER), endOfWeek.format(FORMATTER)};
    }

    public static String[] getDateRangeByMonth(int monthNumber){
        LocalDate nowDate = LocalDate.now();
        LocalDate startDate = nowDate.minusMonths(monthNumber).withDayOfMonth(1);
        return new String[]{startDate.format(FORMATTER), nowDate.format(FORMATTER)};
    }


    public static String getNowDateStr() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate dateObj = LocalDate.now();
        return dateObj.format(formatter);
    }
}

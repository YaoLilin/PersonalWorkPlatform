package com.personalwork.util;

/**
 * @author 姚礼林
 * @desc TODO
 * @date 2024/1/23
 */
public class TimeUtils {
    private TimeUtils() {

    }

    /**
     * 计算开始时间和结束时间之间的时间差
     * @param startTime 开始时间，格式：20:00:00 或 20:00
     * @param endTime 结束时间，格式：20:00:00 或 20:00
     * @return 分钟
     */
    public static int getMinutes(String startTime, String endTime) {
        if ("".equals(startTime) || "".equals(endTime)) {
            return 0;
        }
        String[] stTime = startTime.split(":");
        String[] edTime = endTime.split(":");
        int stHour = Integer.parseInt(stTime[0]);
        int stMin = Integer.parseInt(stTime[1]);
        int endHour = Integer.parseInt(edTime[0]);
        int endMin = Integer.parseInt(edTime[1]);
        int min;
        int hour;
        if (endHour < stHour) {
            hour = 24 - stHour + endHour;
        } else {
            hour = endHour - stHour;
        }
        if (endMin - stMin < 0) {
            hour--;
            min = 60 - stMin + endMin;
        } else {
            min = endMin - stMin;
        }
        return 60 * hour + min;
    }

}

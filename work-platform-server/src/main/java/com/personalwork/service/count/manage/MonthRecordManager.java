package com.personalwork.service.count.manage;

import com.personalwork.enu.TimeRange;
import com.personalwork.exception.MethodParamInvalidException;
import com.personalwork.modal.dto.MonthRecordDto;
import com.personalwork.modal.query.TimeCountChartParam;
import com.personalwork.service.MonthRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * @author yaolilin
 * @desc 获取月份记录
 * @date 2024/8/26
 **/
@Service
@RequiredArgsConstructor
public class MonthRecordManager {
    private final MonthRecordService monthRecordService;

    public List<MonthRecordDto> getMonthRecordList(TimeCountChartParam param) {
        int startYear;
        int startMonth;
        Integer endYear = null;
        Integer endMonth = null;
        if (param.getTimeRange() == TimeRange.CUSTOM) {
            if (param.getStartDate() == null || param.getEndDate() == null) {
                throw new MethodParamInvalidException("开始日期或结束如期为空");
            }
            String[] startDateSplit = param.getStartDate().split("-");
            startYear = Integer.parseInt(startDateSplit[0]);
            startMonth = Integer.parseInt(startDateSplit[1]);
            String[] endDateSplit = param.getEndDate().split("-");
            endYear = Integer.parseInt(endDateSplit[0]);
            endMonth = Integer.parseInt(endDateSplit[1]);
        } else {
            LocalDate date = getStartDate(param.getTimeRange());
            startYear = date.getYear();
            startMonth = date.getMonthValue();
        }
        return monthRecordService.getWorkMonthRecordList(startYear, startMonth, endYear, endMonth);
    }

    private LocalDate getStartDate(TimeRange timeRange) {
        LocalDate now = LocalDate.now();
        LocalDate date;
        switch (timeRange) {
            case NEALY_ONE_MONTH -> date = now;
            case NEALY_TWO_MONTH -> date = now.minusMonths(1);
            case NEALY_THREE_MONTH -> date = now.minusMonths(2);
            case NEALY_SIX_MONTH -> date = now.minusMonths(5);
            case NEALY_TWELVE_MONTH -> date = now.minusMonths(11);
            default -> throw new MethodParamInvalidException("日期范围类型不在范围内");
        }
        return date;
    }
}

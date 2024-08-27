package com.personalwork.service.count.util;

import com.personalwork.exception.ChartCalculateException;
import com.personalwork.modal.entity.TypeDo;
import com.personalwork.modal.vo.PieCountVo;
import com.personalwork.util.NumberUtil;

/**
 * @author yaolilin
 * @desc 领域模型工具
 * @date 2024/8/26
 **/
public class ModelUtil {
    public static PieCountVo buildPipeCountVo(int totalMinutes, TypeDo type, Integer time) {
        PieCountVo countVo = new PieCountVo();
        String typeName = type.getName();
        double percent;
        try {
            percent = NumberUtil.round((double) time / totalMinutes * 100,
                    0, true);
        } catch (NumberFormatException e) {
            throw new ChartCalculateException.TypeChartCalculateException("计算当前类型的时间占比出错，当前类型占用时间："
                    + time + "，总时间：" + totalMinutes + "，类型：" + type, e);
        }
        countVo.setName(typeName);
        countVo.setCount(time);
        countVo.setPercent(percent);
        return countVo;
    }
}

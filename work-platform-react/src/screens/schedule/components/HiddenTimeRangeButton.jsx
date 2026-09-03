import React from "react";
import {Checkbox} from "antd";
import {ClockCircleOutlined} from "@ant-design/icons";

/**
 * <p>日历工具栏中的隐藏时间段按钮内容。</p>
 *
 * @param {Object} props 组件参数
 * @param {Object | null} props.range 当前隐藏时间段设置
 * @param {Function} props.onEnabledChange 切换隐藏时间段启用状态的回调
 * @returns {JSX.Element} 隐藏时间段工具栏内容
 */
const HiddenTimeRangeButton = ({range, onEnabledChange}) => (
    <span className="schedule-hidden-time-range-button-content">
        <ClockCircleOutlined/>
        {range && (
            <>
                <span>{range.start} - {range.end}</span>
                <Checkbox
                    className="schedule-hidden-time-range-checkbox"
                    checked={range.enabled}
                    onChange={(event) => onEnabledChange(event.target.checked)}
                />
            </>
        )}
    </span>
);

export default HiddenTimeRangeButton;

import dayjs from "dayjs";
import {HIDDEN_TIME_RANGE_STORAGE_PREFIX} from "./scheduleConstants";

/**
 * 获取用户隐藏时间段的存储键。
 *
 * @param {string} userName 用户名
 * @returns {string} 存储键
 */
export function getHiddenTimeRangeStorageKey(userName) {
    return `${HIDDEN_TIME_RANGE_STORAGE_PREFIX}-${userName || "anonymous"}`;
}

/**
 * 读取用户隐藏时间段。
 *
 * @param {string} userName 用户名
 * @returns {Object|null} 时间段
 */
export function getHiddenTimeRange(userName) {
    try {
        const value = JSON.parse(localStorage.getItem(getHiddenTimeRangeStorageKey(userName)));
        const validRange = Boolean(value?.start && value?.end && value.start < value.end);
        return validRange ? {
            ...value,
            enabled: value.enabled !== false
        } : null;
    } catch (error) {
        console.error("无法读取隐藏时间范围", error);
        return null;
    }
}

/**
 * 转换时间选择器值。
 *
 * @param {string} time HH:mm 时间
 * @returns {dayjs.Dayjs} 选择器值
 */
export function toTimePickerValue(time) {
    const [hour, minute] = time.split(":").map(Number);
    return dayjs().startOf("day").hour(hour).minute(minute);
}

/**
 * 是否隐藏一个时间轴时段。
 *
 * @param {Date} date 时间
 * @param {Object|null} range 隐藏范围
 * @returns {boolean} 是否隐藏
 */
export function isHiddenTimeSlot(date, range) {
    const time = dayjs(date).format("HH:mm");
    return Boolean(range?.enabled && time >= range.start && time < range.end);
}

/**
 * 获取隐藏时间按钮提示。
 *
 * @param {Object|null} range 隐藏范围
 * @returns {string} 提示
 */
export function getHiddenTimeRangeHint(range) {
    return range ? `设置隐藏时间段（当前：${range.start} - ${range.end}，${range.enabled ? "已启用" : "未启用"}）` : "设置隐藏时间段";
}

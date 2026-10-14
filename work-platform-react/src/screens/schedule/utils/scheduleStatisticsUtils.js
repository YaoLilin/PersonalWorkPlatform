import dayjs from "dayjs";
import {INBOX_CHECKLIST_TYPE_COLOR} from "./scheduleConstants";

/**
 * 获取当前周范围。
 *
 * @returns {Object} 起止时间
 */
export function getCurrentWeekRange() {
    const today = dayjs().startOf("day");
    const offset = today.day() === 0 ? 6 : today.day() - 1;
    return {start: today.subtract(offset, "day"), end: today.subtract(offset, "day").add(1, "week")};
}

/**
 * 统计范围内各项目时长，优先归入日程项目，其次归入清单项目，无项目时按清单或日程名称分组。
 *
 * @param {Array} events 日历事件
 * @param {Object} range 统计范围
 * @returns {Array} 统计数据
 */
export function getProjectTimeStatistics(events, {start: rangeStart, end: rangeEnd}) {
    // key：项目编号、清单编号或无关联日程名称；value：分组名称、累计小时和图表颜色。
    const statistics = new Map();
    events.forEach((event) => {
        const start = dayjs(event.start), end = dayjs(event.end);
        const overlapsRange = start.isValid() && end.isValid() && end.isAfter(start)
            && start.isBefore(rangeEnd) && end.isAfter(rangeStart);
        if (!overlapsRange) return;
        const props = event.extendedProps || {};
        const projectId = props.projectId ?? props.checklistProjectId;
        const hasProject = projectId != null;
        const hasChecklist = Boolean(props.checklistId);
        const projectName = props.projectId != null ? props.projectName : props.checklistProjectName;
        const name = hasProject ? projectName || event.title
            : hasChecklist ? props.checklistName || event.title : event.title;
        const key = hasProject ? `project-${projectId}`
            : hasChecklist ? `checklist-${props.checklistId}` : name;
        const item = statistics.get(key) || {
            name,
            value: 0,
            itemStyle: {color: event.extendedProps?.scheduleColor || event.backgroundColor || INBOX_CHECKLIST_TYPE_COLOR}
        };
        item.value += (end.isBefore(rangeEnd) ? end : rangeEnd).diff(start.isAfter(rangeStart) ? start : rangeStart, "minute", true) / 60;
        statistics.set(key, item);
    });
    return [...statistics.values()];
}

/**
 * 截断数值到两位小数。
 *
 * @param {number} value 数值
 * @returns {number} 截断值
 */
export function truncateToTwoDigits(value) {
    return Math.floor(value * 100) / 100;
}

/**
 * 格式化小时。
 *
 * @param {number} hours 小时数
 * @returns {string} 显示值
 */
export function formatHours(hours) {
    return truncateToTwoDigits(hours).toFixed(2);
}

/**
 * 获取统计标题。
 *
 * @param {string} viewType 视图类型
 * @returns {string} 标题
 */
export function getProjectTimeStatisticsTitle(viewType) {
    return viewType === "dayGridMonth" ? "本月日程时间占比" : viewType === "timeGridDay" ? "当日日程时间占比" : "本周日程时间占比";
}

/**
 * 获取统计总时间标签。
 *
 * @param {string} viewType 视图类型
 * @returns {string} 标签
 */
export function getProjectTimeTotalLabel(viewType) {
    return viewType === "dayGridMonth" ? "本月项目总时间" : viewType === "timeGridDay" ? "当日项目总时间" : "本周项目总时间";
}

import dayjs from "dayjs";
import {FolderOutlined} from "@ant-design/icons";

export const HIDDEN_TIME_RANGE_STORAGE_PREFIX = "schedule-hidden-time-range";
export const INBOX_CHECKLIST_TYPE_KEY = "inbox-checklist-type";
export const INBOX_CHECKLIST_TYPE_NAME = "收集箱";
export const INBOX_CHECKLIST_TYPE_COLOR = "#1677FF";

/**
 * 将日期和时间转换为日历事件时间。
 *
 * @param {string} date 日期
 * @param {string} time 时间
 * @returns {string} ISO 时间
 */
export function toDateTime(date, time) {
    return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

/**
 * 将项目时间记录转换为日历事件。
 *
 * @param {Array} projectTimes 项目时间记录
 * @param {Object} checklistTypeColors 清单编号到类型颜色的映射
 * @returns {Array} 日历事件
 */
export function toScheduleEvents(projectTimes, checklistTypeColors = {}) {
    return projectTimes.filter((item) => item.date && item.startTime && item.endTime).map((item) => {
        const completed = Boolean(item.checklistId && item.checklistIsDone === 1);
        const originalColor = getScheduleColor(item, checklistTypeColors);
        const displayColor = completed ? getMutedScheduleColor(originalColor) : originalColor;
        return {
            id: String(item.id), title: item.scheduleName || item.checklistName || item.projectName || "未命名日程",
            start: toDateTime(item.date, item.startTime), end: toDateTime(item.endDate || item.date, item.endTime),
            backgroundColor: displayColor,
            borderColor: displayColor,
            textColor: completed ? "#262626" : "#fff",
            classNames: completed ? ["schedule-checklist-completed"] : [],
            extendedProps: {
                projectId: item.projectId, projectName: item.projectName, projectColor: item.projectColor || "#1677FF",
                checklistId: item.checklistId, checklistName: item.checklistName,
                checklistTypeColor: item.checklistTypeColor || checklistTypeColors[item.checklistId] || INBOX_CHECKLIST_TYPE_COLOR,
                checklistIsDone: item.checklistIsDone,
                description: item.description || "", scheduleId: item.id
            },
        };
    });
}

/**
 * 将已完成清单的原色与浅灰色混合，保持颜色来源仍可辨认。
 *
 * @param {string} color 清单类型的 HEX 颜色
 * @returns {string} 降低饱和度后的颜色
 */
function getMutedScheduleColor(color) {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return color;
    const channels = [1, 3, 5].map((offset) => Math.round(
        parseInt(color.slice(offset, offset + 2), 16) * 0.4 + 217 * 0.6
    ).toString(16).padStart(2, "0"));
    return `#${channels.join("")}`;
}

/**
 * 获取一个日程的展示颜色。
 *
 * @param {Object} item 日程接口数据
 * @param {Object} checklistTypeColors 清单编号到类型颜色的映射
 * @returns {string} 日程颜色
 */
function getScheduleColor(item, checklistTypeColors) {
    if (item.checklistId) {
        return item.checklistTypeColor || checklistTypeColors[item.checklistId] || INBOX_CHECKLIST_TYPE_COLOR;
    }
    return item.projectColor || "#1677FF";
}

/**
 * 将日历事件转换为接口参数。
 *
 * @param {Object} event 日历事件
 * @returns {Object} 接口参数
 */
export function toScheduleParam(event) {
    const startTime = dayjs(event.start);
    const endTime = event.end ? dayjs(event.end) : startTime.add(1, "hour");
    return {
        projectId: event.extendedProps.projectId,
        checklistId: event.extendedProps.checklistId,
        checklistTypeId: event.extendedProps.checklistTypeId,
        createChecklist: event.extendedProps.createChecklist,
        scheduleName: event.title,
        description: event.extendedProps.description || "",
        date: startTime.format("YYYY-MM-DD"),
        endDate: endTime.format("YYYY-MM-DD"),
        startTime: startTime.format("HH:mm:ss"),
        endTime: endTime.format("HH:mm:ss")
    };
}

/**
 * 获取可展示的请求错误信息。
 *
 * @param {Object} error 请求错误
 * @returns {string} 错误文案
 */
export function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || "日程保存失败";
}

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
        return value?.start && value?.end && value.start < value.end ? {
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

/**
 * 获取指针对应的日程时间。
 *
 * @param {HTMLElement} element 日历元素
 * @param {PointerEvent} event 指针事件
 * @returns {dayjs.Dayjs|null} 时间
 */
export function getPointerScheduleTime(element, event) {
    const slot = [...element.querySelectorAll(".fc-timegrid-slot-lane[data-time]")].find((item) => {
        const rect = item.getBoundingClientRect();
        return event.clientY >= rect.top && event.clientY < rect.bottom;
    });
    const column = [...element.querySelectorAll(".fc-timegrid-col[data-date]")].find((item) => {
        const rect = item.getBoundingClientRect();
        return event.clientX >= rect.left && event.clientX <= rect.right;
    });
    if (!slot || !column?.dataset.date || !slot.dataset.time) return null;
    const rect = slot.getBoundingClientRect();
    return dayjs(`${column.dataset.date}T${slot.dataset.time}`).add(event.clientY - rect.top >= rect.height / 2 ? 15 : 0, "minute");
}

/**
 * 构建拖动选中范围。
 *
 * @param {dayjs.Dayjs} start 开始时间
 * @param {dayjs.Dayjs} current 当前时间
 * @returns {Object} 时间范围
 */
export function getSelectionTimeRange(start, current) {
    return current.isBefore(start) ? {start: current, end: start.add(15, "minute")} : {
        start,
        end: current.add(15, "minute")
    };
}

/**
 * 判断编辑器是否变更。
 *
 * @param {Object} editor 编辑器状态
 * @returns {boolean} 是否变更
 */
export function hasEventEditorChanged(editor) {
    const [start, end] = editor.timeRange || [];
    return (editor.title.trim() || "未命名日程") !== editor.originalEvent.title
        || editor.description !== editor.originalEvent.description
        || editor.projectId !== editor.originalEvent.projectId
        || editor.checklistTypeId !== editor.originalEvent.checklistTypeId
        || !start?.isSame(editor.originalEvent.start)
        || !end?.isSame(editor.originalEvent.end);
}

/**
 * 获取外部项目拖入后依附的目标单元格。
 *
 * @param {HTMLElement|null} element 日历元素
 * @param {Date} start 事件开始时间
 * @returns {DOMRect|undefined} 单元格区域
 */
export function getDroppedEventRect(element, start) {
    if (!element) return undefined;
    const time = dayjs(start);
    const date = time.format("YYYY-MM-DD");
    const seconds = time.hour() * 3600 + time.minute() * 60 + time.second();
    const slot = [...element.querySelectorAll(".fc-timegrid-slot-lane[data-time]")].reduce((matched, item) => {
        const [hour, minute, second = 0] = item.dataset.time.split(":").map(Number);
        const itemSeconds = hour * 3600 + minute * 60 + second;
        if (itemSeconds > seconds) return matched;
        if (!matched) return item;
        const [matchedHour, matchedMinute, matchedSecond = 0] = matched.dataset.time.split(":").map(Number);
        return itemSeconds > matchedHour * 3600 + matchedMinute * 60 + matchedSecond ? item : matched;
    }, null);
    const column = element.querySelector(`.fc-timegrid-col[data-date="${date}"]`);
    if (slot && column) {
        const slotRect = slot.getBoundingClientRect();
        const columnRect = column.getBoundingClientRect();
        return new DOMRect(columnRect.left, slotRect.top, columnRect.width, slotRect.height);
    }
    return element.querySelector(`.fc-daygrid-day[data-date="${date}"]`)?.getBoundingClientRect();
}

/**
 * 将项目放入类型树。
 *
 * @param {Array} types 类型树
 * @param {Array} projects 项目列表
 * @returns {Array} 树节点
 */
export function toProjectTree(types, projects) {
    const toNode = (project) => ({
        key: `project-${project.id}`,
        title: <span className="schedule-project-item" data-project-id={project.id}
                     data-project-name={project.name} data-schedule-color={project.color || "#1677FF"}>
            <span className="schedule-project-color" style={{backgroundColor: project.color || "#1677FF"}}/>
            {project.name}
        </span>,
        isLeaf: true
    });
    const toTypes = (items) => items.map((type) => ({
        key: `type-${type.value}`,
        title: <span><FolderOutlined className="schedule-type-icon"/>{type.title}</span>,
        children: [...(type.children ? toTypes(type.children) : []), ...projects.filter((project) => project.typeId === type.value).map(toNode)]
    }));
    const uncategorized = projects.filter((project) => !project.typeId).map(toNode);
    return uncategorized.length ? [...toTypes(types), {
        key: "uncategorized-projects",
        title: "未分类项目",
        children: uncategorized
    }] : toTypes(types);
}

/**
 * 将清单放入清单类型树。
 *
 * @param {Array} types 清单类型树
 * @param {Array} checklists 清单列表
 * @returns {Array} 树节点
 */
export function toChecklistTree(types, checklists) {
    const toNode = (checklist, typeColor) => ({
        key: `checklist-${checklist.id}`,
        checklist,
        title: <span
            className="schedule-checklist-item"
            data-checklist-id={checklist.id}
            data-project-id={checklist.projectId || ""}
            data-schedule-name={checklist.name}
            data-schedule-color={checklist.isDone === 1
                ? getMutedScheduleColor(typeColor || "#1677FF") : typeColor || "#1677FF"}
            data-schedule-text-color={checklist.isDone === 1 ? "#262626" : "#fff"}
        >
            <span className="schedule-project-color" style={{backgroundColor: typeColor || "#1677FF"}}/>
            {checklist.name}
        </span>,
        isLeaf: true,
    });
    const toTypes = (items) => items.map((type) => ({
        key: `checklist-type-${type.value}`,
        title: <span><FolderOutlined className="schedule-type-icon"/>{type.title}</span>,
        children: [
            ...(type.children ? toTypes(type.children) : []),
            ...checklists
                .filter((checklist) => checklist.checklistTypeId === type.value)
                .map((checklist) => toNode(checklist, type.color)),
        ],
    }));
    const inboxChecklists = checklists.filter((checklist) => !checklist.checklistTypeId);
    const inboxNode = [{
        key: INBOX_CHECKLIST_TYPE_KEY,
        title: <span><FolderOutlined className="schedule-type-icon"/>{INBOX_CHECKLIST_TYPE_NAME}</span>,
        children: inboxChecklists.map((checklist) => toNode(checklist, INBOX_CHECKLIST_TYPE_COLOR)),
    }];
    return [...inboxNode, ...toTypes(types)];
}

/**
 * 构建清单编号到所属类型颜色的映射。
 *
 * @param {Array} types 清单类型树
 * @param {Array} checklists 清单列表
 * @returns {Object} 键为清单编号、值为类型颜色的映射
 */
export function getChecklistTypeColors(types, checklists) {
    const typeColors = {};
    const addTypeColors = (items) => items.forEach((type) => {
        typeColors[type.value] = type.color || "#1677FF";
        addTypeColors(type.children || []);
    });
    addTypeColors(types);
    return checklists.reduce((colors, checklist) => ({
        ...colors,
        [checklist.id]: checklist.checklistTypeId
            ? typeColors[checklist.checklistTypeId] || INBOX_CHECKLIST_TYPE_COLOR
            : INBOX_CHECKLIST_TYPE_COLOR,
    }), {});
}

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
 * 统计范围内各项目时长。
 *
 * @param {Array} events 日历事件
 * @param {Object} range 统计范围
 * @returns {Array} 统计数据
 */
export function getProjectTimeStatistics(events, {start: rangeStart, end: rangeEnd}) {
    const statistics = new Map();
    events.forEach((event) => {
        const start = dayjs(event.start), end = dayjs(event.end);
        if (!start.isValid() || !end.isValid() || !end.isAfter(start) || !start.isBefore(rangeEnd) || !end.isAfter(rangeStart)) return;
        const checklistId = event.extendedProps?.checklistId;
        const name = checklistId ? event.extendedProps?.checklistName || event.title
            : event.extendedProps?.projectName || event.title;
        const key = checklistId ? `checklist-${checklistId}`
            : event.extendedProps?.projectId === undefined ? name : `project-${event.extendedProps.projectId}`;
        const item = statistics.get(key) || {
            name,
            value: 0,
            itemStyle: {color: checklistId ? event.extendedProps?.checklistTypeColor || INBOX_CHECKLIST_TYPE_COLOR
                : event.extendedProps?.projectColor || event.backgroundColor || "#1677FF"}
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

import dayjs from "dayjs";
import {getInheritedTypeColors} from "../../../util/typeColorUtils";
import {INBOX_CHECKLIST_TYPE_COLOR} from "./scheduleConstants";

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
 * @param {Object} projectColors 项目编号到有效颜色的映射
 * @returns {Array} 日历事件
 */
export function toScheduleEvents(projectTimes, checklistTypeColors = {}, projectColors = {}) {
    return projectTimes.filter((item) => item.date && item.startTime && item.endTime).map((item) => {
        const completed = Boolean(item.checklistId && item.checklistIsDone === 1);
        const projectId = item.projectId ?? item.checklistProjectId;
        const originalColor = getScheduleColor(item, checklistTypeColors, projectColors);
        const displayColor = completed ? getMutedScheduleColor(originalColor) : originalColor;
        return {
            id: String(item.id), title: item.scheduleName || item.checklistName || item.projectName || "未命名日程",
            start: toDateTime(item.date, item.startTime), end: toDateTime(item.endDate || item.date, item.endTime),
            backgroundColor: displayColor,
            borderColor: displayColor,
            textColor: completed ? "#262626" : "#fff",
            classNames: completed ? ["schedule-checklist-completed"] : [],
            extendedProps: {
                projectId: item.projectId, projectName: item.projectName,
                checklistProjectId: item.checklistProjectId, checklistProjectName: item.checklistProjectName,
                projectColor: projectColors[projectId],
                checklistId: item.checklistId, checklistName: item.checklistName,
                checklistTypeColor: checklistTypeColors[item.checklistId] || item.checklistTypeColor || INBOX_CHECKLIST_TYPE_COLOR,
                scheduleColor: originalColor,
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
export function getMutedScheduleColor(color) {
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
 * @param {Object} projectColors 项目编号到有效颜色的映射
 * @returns {string} 日程颜色
 */
function getScheduleColor(item, checklistTypeColors, projectColors) {
    const projectColor = projectColors[item.projectId ?? item.checklistProjectId];
    return projectColor || checklistTypeColors[item.checklistId] || item.checklistTypeColor || INBOX_CHECKLIST_TYPE_COLOR;
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
 * 构建项目编号到有效颜色的映射，保留无配置项目以供清单类型回退。
 *
 * @param {Array} types 项目类型树
 * @param {Array} projects 项目列表
 * @returns {Object} 项目编号到有效颜色的映射
 */
export function getProjectColors(types, projects) {
    const typeColors = getInheritedTypeColors(types);
    return Object.fromEntries(projects.map((project) => [
        project.id, project.customColor || typeColors[project.typeId]
    ]));
}

/**
 * 构建清单编号到所属类型颜色的映射。
 *
 * @param {Array} types 清单类型树
 * @param {Array} checklists 清单列表
 * @returns {Object} 键为清单编号、值为类型颜色的映射
 */
export function getChecklistTypeColors(types, checklists) {
    const typeColors = getInheritedTypeColors(types);
    return Object.fromEntries(checklists.map((checklist) => [
        checklist.id, typeColors[checklist.checklistTypeId] || INBOX_CHECKLIST_TYPE_COLOR
    ]));
}

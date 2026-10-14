import {useCallback, useEffect, useState} from "react";
import ScheduleApi from "../../../request/scheduleApi";
import {getErrorMessage, toScheduleEvents, toScheduleParam} from "../utils/scheduleEventUtils";

/**
 * 管理日程集合及创建、替换、拖拽保存和删除。
 *
 * @param {Object} options 日程集合依赖
 * @param {Array} options.initialEvents 路由加载的初始事件
 * @param {Array} options.projectOptions 创建日程的默认项目名称
 * @param {Object} options.checklistTypeColors 清单编号到颜色的映射
 * @param {Object} options.projectColors 项目编号到颜色的映射
 * @param {Object} options.messageApi 消息提示接口
 * @param {Function} options.onChecklistCreated 新建清单后的回调
 * @param {Function} options.onChecklistChanged 已有清单变更后的回调
 * @returns {Object} 日程集合及持久化操作
 */
export function useScheduleEvents({
    initialEvents, projectOptions, checklistTypeColors, projectColors,
    messageApi, onChecklistCreated, onChecklistChanged,
}) {
    const [scheduleEvents, setScheduleEvents] = useState(initialEvents);

    /**
     * 路由数据重新加载后，以服务端最新的日程和清单类型颜色更新日历。
     */
    useEffect(() => setScheduleEvents(initialEvents), [initialEvents]);

    const replaceEvent = useCallback((scheduleEvent) => {
        const [updated] = toScheduleEvents([scheduleEvent], checklistTypeColors, projectColors);
        setScheduleEvents((items) => items.map((item) => item.id === updated.id ? updated : item));
    }, [checklistTypeColors, projectColors]);
    const createSchedule = async (editor) => {
        const [start, end] = editor.timeRange || [];
        if (!start || !end) return;
        const project = projectOptions.find((item) => item.value === editor.projectId);
        const event = {
            title: editor.title.trim() || project?.label || "未命名日程",
            start: start.toDate(),
            end: end.toDate(),
            extendedProps: {
                projectId: editor.projectId,
                checklistId: editor.checklistId,
                checklistTypeId: editor.checklistTypeId,
                createChecklist: !editor.checklistId,
                description: editor.description,
            }
        };
        let saved;
        try {
            saved = await ScheduleApi.createSchedule(toScheduleParam(event));
        } catch (error) {
            messageApi.error(`创建日程失败: ${getErrorMessage(error)}`, 5);
            return;
        }
        setScheduleEvents((items) => [...items, toScheduleEvents([saved], checklistTypeColors, projectColors)[0]]);
        if (saved.checklistId && !editor.checklistId) onChecklistCreated();
        else if (saved.checklistId) onChecklistChanged();
    };

    /**
     * 更新拖拽或缩放后的日程时间。
     *
     * @param {Object} info FullCalendar 更新信息
     */
    const updateTime = async (info) => {
        try {
            replaceEvent(await ScheduleApi.updateSchedule(info.event.extendedProps.scheduleId || info.event.id, toScheduleParam(info.event)));
            if (info.event.extendedProps.checklistId) onChecklistChanged();
        } catch (error) {
            info.revert();
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    /**
     * 删除右键选中的日程。
     *
     * @param {Object} event 右键菜单选中的日历事件
     * @returns {Promise<void>} 删除操作
     */
    const deleteEvent = async (event) => {
        if (!event) return;
        try {
            await ScheduleApi.deleteSchedule(event.extendedProps.scheduleId || event.id);
            event.remove();
            setScheduleEvents((items) => items.filter((item) => item.id !== event.id));
            if (event.extendedProps.checklistId) onChecklistChanged();
        } catch (error) {
            messageApi.error(getErrorMessage(error), 5);
        }
    };
    return {scheduleEvents, replaceEvent, createSchedule, updateTime, deleteEvent, onChecklistChanged};
}

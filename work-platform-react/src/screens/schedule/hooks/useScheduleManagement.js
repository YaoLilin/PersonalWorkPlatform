import {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";
import ScheduleApi from "../../../request/scheduleApi";
import {
    getDroppedEventRect,
    getErrorMessage,
    hasEventEditorChanged,
    toScheduleEvents,
    toScheduleParam
} from "../utils/scheduleUtils";

const EDITOR_WIDTH = 350;
const EDITOR_HEIGHT = 400;
const VIEWPORT_OFFSET = 8;

/**
 * 管理日程的编辑、创建、删除与拖拽更新。
 *
 * @param {{calendarRef: Object, projectOptions: Array, messageApi: Object, initialEvents: Array, checklistTypeColors: Object, onChecklistCreated: Function}} options 业务依赖
 * @returns {Object} 日程状态与操作
 */
export function useScheduleManagement({
    calendarRef,
    projectOptions,
    messageApi,
    initialEvents,
    checklistTypeColors,
    onChecklistCreated,
}) {
    const [scheduleEvents, setScheduleEvents] = useState(initialEvents);
    const [contextMenu, setContextMenu] = useState(null);
    const [eventEditor, setEventEditor] = useState(null);

    /**
     * 路由数据重新加载后，以服务端最新的日程和清单类型颜色更新日历。
     */
    useEffect(() => setScheduleEvents(initialEvents), [initialEvents]);

    const replaceEvent = useCallback((scheduleEvent) => {
        const [updated] = toScheduleEvents([scheduleEvent], checklistTypeColors);
        setScheduleEvents((items) => items.map((item) => item.id === updated.id ? updated : item));
    }, [checklistTypeColors]);
    const closeEditor = useCallback(() => setEventEditor(null), []);
    const editorPosition = (left, top) => ({
        left: Math.max(VIEWPORT_OFFSET, Math.min(left, window.innerWidth - EDITOR_WIDTH - VIEWPORT_OFFSET)),
        top: Math.max(VIEWPORT_OFFSET, Math.min(top, window.innerHeight - EDITOR_HEIGHT - VIEWPORT_OFFSET))
    });

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
                createChecklist: editor.createChecklist,
                description: editor.description,
            }
        };
        try {
            const saved = await ScheduleApi.createSchedule(toScheduleParam(event));
            setScheduleEvents((items) => [...items, toScheduleEvents([saved], checklistTypeColors)[0]]);
            if (editor.createChecklist && saved.checklistId) onChecklistCreated();
        } catch (error) {
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    /**
     * 保存当前编辑器内容。
     *
     * @param {boolean} create 是否创建新日程
     * @returns {Promise<void>} 保存操作
     */
    const saveEditor = async (create = false) => {
        const editor = eventEditor;
        if (!editor) return;
        if (editor.isNew) {
            setEventEditor(null);
            if (create) await createSchedule(editor);
            return;
        }
        const event = calendarRef.current?.getApi()?.getEventById(editor.eventId);
        const [start, end] = editor.timeRange || [];
        if (!event || !start || !end) return;
        if (!hasEventEditorChanged(editor)) {
            setEventEditor(null);
            return;
        }
        event.setProp("title", editor.title.trim() || "未命名日程");
        event.setStart(start.toDate());
        event.setEnd(end.toDate());
        event.setExtendedProp("description", editor.description);
        event.setExtendedProp("projectId", editor.projectId);
        event.setExtendedProp("checklistId", editor.checklistId);
        setEventEditor(null);
        try {
            const saved = await ScheduleApi.updateSchedule(event.extendedProps.scheduleId || event.id, toScheduleParam(event));
            const [savedEvent] = toScheduleEvents([saved], checklistTypeColors);
            event.setProp("backgroundColor", savedEvent.backgroundColor);
            event.setProp("borderColor", savedEvent.borderColor);
            replaceEvent(saved);
        } catch (error) {
            event.setProp("title", editor.originalEvent.title);
            event.setStart(editor.originalEvent.start);
            event.setEnd(editor.originalEvent.end);
            event.setProp("backgroundColor", editor.originalEvent.backgroundColor);
            event.setProp("borderColor", editor.originalEvent.borderColor);
            event.setExtendedProp("description", editor.originalEvent.description);
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    /**
     * 打开已有日程编辑器。
     *
     * @param {Object} info FullCalendar 事件信息
     */
    const openEditor = (info) => {
        void saveEditor();
        const end = info.event.end ? dayjs(info.event.end) : dayjs(info.event.start).add(1, "hour");
        const rect = info.el.getBoundingClientRect();
        const left = rect.right + VIEWPORT_OFFSET + EDITOR_WIDTH <= window.innerWidth ? rect.right + VIEWPORT_OFFSET : rect.left - EDITOR_WIDTH - 2;
        setContextMenu(null);
        setEventEditor({
            eventId: info.event.id,
            title: info.event.title,
            description: info.event.extendedProps.description || "",
            projectId: info.event.extendedProps.projectId,
            checklistId: info.event.extendedProps.checklistId,
            originalEvent: {
                title: info.event.title,
                start: info.event.start,
                end: end.toDate(),
                description: info.event.extendedProps.description || "",
                projectId: info.event.extendedProps.projectId,
                checklistId: info.event.extendedProps.checklistId,
                backgroundColor: info.event.backgroundColor,
                borderColor: info.event.borderColor
            },
            timeRange: [dayjs(info.event.start), end], ...editorPosition(left, rect.bottom + VIEWPORT_OFFSET)
        });
    };

    /**
     * 打开新日程编辑器。
     *
     * @param {Object} info FullCalendar 选中信息
     */
    const openNewEditor = (info) => {
        if (!info.view.type.startsWith("timeGrid")) return;
        void saveEditor();
        info.view.calendar.unselect();
        setContextMenu(null);
        setEventEditor({
            isNew: true,
            title: "",
            description: "",
            projectId: undefined,
            originalEvent: {title: "", description: "", projectId: undefined, start: info.start, end: info.end},
            timeRange: [dayjs(info.start), dayjs(info.end)], ...editorPosition(info.jsEvent.clientX + VIEWPORT_OFFSET, info.jsEvent.clientY + VIEWPORT_OFFSET)
        });
    };

    /**
     * 打开外部拖入项目的编辑器。
     *
     * @param {Object} info FullCalendar 接收信息
     */
    const openDroppedEditor = (info) => {
        void saveEditor();
        const end = info.event.end ? dayjs(info.event.end) : dayjs(info.event.start).add(1, "hour");
        const rect = getDroppedEventRect(calendarRef.current?.elRef?.current, info.event.start);
        const left = rect && rect.right + VIEWPORT_OFFSET + EDITOR_WIDTH <= window.innerWidth ? rect.right + VIEWPORT_OFFSET : (rect?.left || window.innerWidth / 2) - EDITOR_WIDTH - VIEWPORT_OFFSET;
        info.event.remove();
        setEventEditor({
            isNew: true,
            title: info.event.title,
            description: info.event.extendedProps.description || "",
            projectId: info.event.extendedProps.projectId ? Number(info.event.extendedProps.projectId) : undefined,
            checklistId: info.event.extendedProps.checklistId ? Number(info.event.extendedProps.checklistId) : undefined,
            createChecklist: Boolean(info.event.extendedProps.createChecklist),
            originalEvent: {
                title: "",
                description: "",
                projectId: undefined,
                checklistId: undefined,
                start: info.event.start,
                end: end.toDate()
            },
            timeRange: [dayjs(info.event.start), end], ...editorPosition(left, (rect?.top || window.innerHeight / 2) + VIEWPORT_OFFSET)
        });
    };

    /**
     * 更新拖拽或缩放后的日程时间。
     *
     * @param {Object} info FullCalendar 更新信息
     */
    const updateTime = async (info) => {
        try {
            replaceEvent(await ScheduleApi.updateSchedule(info.event.extendedProps.scheduleId || info.event.id, toScheduleParam(info.event)));
        } catch (error) {
            info.revert();
            messageApi.error(getErrorMessage(error), 5);
        }
    };

    /**
     * 删除右键选中的日程。
     *
     * @returns {Promise<void>} 删除操作
     */
    const deleteEvent = async () => {
        const event = contextMenu?.calendarEvent;
        if (!event) return;
        setContextMenu(null);
        setEventEditor(null);
        try {
            await ScheduleApi.deleteSchedule(event.extendedProps.scheduleId || event.id);
            event.remove();
            setScheduleEvents((items) => items.filter((item) => item.id !== event.id));
        } catch (error) {
            messageApi.error(getErrorMessage(error), 5);
        }
    };
    const openContextMenu = (event, calendarEvent) => {
        event.preventDefault();
        void saveEditor();
        setEventEditor(null);
        setContextMenu({calendarEvent, ...editorPosition(event.clientX, event.clientY)});
    };
    return {
        scheduleEvents,
        contextMenu,
        eventEditor,
        setEventEditor,
        setContextMenu,
        closeEditor,
        saveEditor,
        openEditor,
        openNewEditor,
        openDroppedEditor,
        updateTime,
        deleteEvent,
        openContextMenu
    };
}

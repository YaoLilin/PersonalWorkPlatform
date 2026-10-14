import {useState} from "react";
import dayjs from "dayjs";
import ScheduleApi from "../../../request/scheduleApi";
import {ChecklistApi} from "../../../request/checklistApi";
import {getDroppedEventRect} from "../utils/scheduleDomUtils";
import {getErrorMessage, hasEventEditorChanged, toScheduleEvents, toScheduleParam} from "../utils/scheduleEventUtils";
import {applyEditorToEvent, restoreEditorEvent} from "../utils/scheduleEditorUtils";

const EDITOR_WIDTH = 350;
const EDITOR_HEIGHT = 450;
const VIEWPORT_OFFSET = 8;

/**
 * 管理日程草稿、编辑浮层位置及已有日程的保存和失败恢复。
 *
 * @param {Object} options 编辑器依赖
 * @param {Object} options.calendarRef 日历引用
 * @param {Array} options.checklists 清单及类型信息
 * @param {Object} options.events 日程集合操作
 * @param {Object} options.messageApi 消息提示接口
 * @param {Object} options.checklistTypeColors 清单编号到颜色的映射
 * @param {Object} options.projectColors 项目编号到颜色的映射
 * @param {Function} options.onOpen 打开编辑器前关闭互斥菜单
 * @returns {Object} 编辑器草稿及打开、保存、关闭操作
 */
export function useScheduleEditor({calendarRef, checklists, events, messageApi, checklistTypeColors, projectColors, onOpen}) {
    const [eventEditor, setEventEditor] = useState(null);
    const closeEditor = () => setEventEditor(null);
    const editorPosition = (left, top) => ({
        left: Math.max(VIEWPORT_OFFSET, Math.min(left, window.innerWidth - EDITOR_WIDTH - VIEWPORT_OFFSET)),
        top: Math.max(VIEWPORT_OFFSET, Math.min(top, window.innerHeight - EDITOR_HEIGHT - VIEWPORT_OFFSET))
    });
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
            if (create) await events.createSchedule(editor);
            return;
        }
        const event = calendarRef.current?.getApi()?.getEventById(editor.eventId);
        const [start, end] = editor.timeRange || [];
        if (!event || !start || !end) return;
        if (!hasEventEditorChanged(editor)) {
            setEventEditor(null);
            return;
        }
        applyEditorToEvent(event, editor);
        setEventEditor(null);
        await saveExistingEvent(event, editor);
    };

    /** 保存清单类型和日程，失败时恢复日历展示并重新加载服务端状态。 */
    const saveExistingEvent = async (event, editor) => {
        try {
            const checklist = checklists.find((item) => item.id === editor.checklistId);
            const typeChanged = Boolean(checklist && (checklist.checklistTypeId ?? undefined) !== editor.checklistTypeId);
            if (typeChanged) {
                await ChecklistApi.updateChecklist(checklist.id, {
                    name: checklist.name,
                    projectId: checklist.projectId,
                    checklistTypeId: editor.checklistTypeId,
                });
            }
            const saved = await ScheduleApi.updateSchedule(event.extendedProps.scheduleId || event.id, toScheduleParam(event));
            const [savedEvent] = toScheduleEvents([saved], checklistTypeColors, projectColors);
            event.setProp("backgroundColor", savedEvent.backgroundColor);
            event.setProp("borderColor", savedEvent.borderColor);
            event.setProp("textColor", savedEvent.textColor);
            events.replaceEvent(saved);
            const checklistChanged = Boolean(checklist && (typeChanged || editor.title.trim() !== editor.originalEvent.title));
            if (checklistChanged) events.onChecklistChanged();
        } catch (error) {
            restoreEditorEvent(event, editor.originalEvent);
            events.onChecklistChanged();
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
        const fitsRight = rect.right + VIEWPORT_OFFSET + EDITOR_WIDTH <= window.innerWidth;
        const left = fitsRight ? rect.right + VIEWPORT_OFFSET : rect.left - EDITOR_WIDTH - 2;
        const checklist = checklists.find((item) => item.id === info.event.extendedProps.checklistId);
        onOpen();
        setEventEditor({
            eventId: info.event.id,
            title: info.event.title,
            description: info.event.extendedProps.description || "",
            projectId: info.event.extendedProps.projectId,
            checklistId: info.event.extendedProps.checklistId,
            checklistTypeId: checklist?.checklistTypeId ?? undefined,
            originalEvent: {
                title: info.event.title,
                start: info.event.start,
                end: end.toDate(),
                description: info.event.extendedProps.description || "",
                projectId: info.event.extendedProps.projectId,
                checklistId: info.event.extendedProps.checklistId,
                checklistTypeId: checklist?.checklistTypeId ?? undefined,
                backgroundColor: info.event.backgroundColor,
                borderColor: info.event.borderColor,
                textColor: info.event.textColor,
            },
            timeRange: [dayjs(info.event.start), end],
            ...editorPosition(left, rect.bottom + VIEWPORT_OFFSET)
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
        onOpen();
        setEventEditor({
            isNew: true,
            title: "",
            description: "",
            projectId: undefined,
            checklistTypeId: undefined,
            originalEvent: {title: "", description: "", projectId: undefined, start: info.start, end: info.end},
            timeRange: [dayjs(info.start), dayjs(info.end)],
            ...editorPosition(info.jsEvent.clientX + VIEWPORT_OFFSET, info.jsEvent.clientY + VIEWPORT_OFFSET)
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
        const fitsRight = Boolean(rect && rect.right + VIEWPORT_OFFSET + EDITOR_WIDTH <= window.innerWidth);
        const left = fitsRight ? rect.right + VIEWPORT_OFFSET
            : (rect?.left || window.innerWidth / 2) - EDITOR_WIDTH - VIEWPORT_OFFSET;
        info.event.remove();
        setEventEditor({
            isNew: true,
            title: info.event.title,
            description: info.event.extendedProps.description || "",
            projectId: info.event.extendedProps.projectId ? Number(info.event.extendedProps.projectId) : undefined,
            checklistId: info.event.extendedProps.checklistId ? Number(info.event.extendedProps.checklistId) : undefined,
            checklistTypeId: info.event.extendedProps.checklistTypeId ? Number(info.event.extendedProps.checklistTypeId) : undefined,
            originalEvent: {
                title: "",
                description: "",
                projectId: undefined,
                checklistId: undefined,
                start: info.event.start,
                end: end.toDate()
            },
            timeRange: [dayjs(info.event.start), end],
            ...editorPosition(left, (rect?.top || window.innerHeight / 2) + VIEWPORT_OFFSET)
        });
    };
    return {eventEditor, setEventEditor, closeEditor, saveEditor, openEditor, openNewEditor, openDroppedEditor};
}

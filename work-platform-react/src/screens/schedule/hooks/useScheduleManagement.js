import {useState} from "react";
import {useScheduleEvents} from "./useScheduleEvents";
import {useScheduleEditor} from "./useScheduleEditor";

const MENU_WIDTH = 120;
const MENU_HEIGHT = 44;
const VIEWPORT_OFFSET = 8;

/**
 * 协调日程集合、编辑器与右键菜单，互斥状态保留在共同管理层。
 *
 * @param {Object} options 日程业务依赖
 * @param {Object} options.calendarRef 日历引用
 * @param {Array} options.projectOptions 创建日程的项目选项
 * @param {Array} options.checklists 已有清单
 * @param {Object} options.messageApi 消息提示接口
 * @param {Array} options.initialEvents 路由加载的日程
 * @param {Object} options.checklistTypeColors 清单编号到颜色的映射
 * @param {Object} options.projectColors 项目编号到颜色的映射
 * @param {Function} options.onChecklistCreated 新建清单后的回调
 * @param {Function} options.onChecklistChanged 清单变更后的回调
 * @returns {Object} 页面使用的日程状态与操作
 */
export function useScheduleManagement(options) {
    const [contextMenu, setContextMenu] = useState(null);
    const events = useScheduleEvents(options);
    const editor = useScheduleEditor({
        calendarRef: options.calendarRef,
        checklists: options.checklists,
        messageApi: options.messageApi,
        checklistTypeColors: options.checklistTypeColors,
        projectColors: options.projectColors,
        events,
        onOpen: () => setContextMenu(null),
    });

    /** 删除右键菜单选中的日程，并关闭相关浮层。 */
    const deleteEvent = async () => {
        const event = contextMenu?.calendarEvent;
        if (!event) return;
        setContextMenu(null);
        editor.closeEditor();
        await events.deleteEvent(event);
    };

    /** 保存当前草稿后打开右键菜单，位置限制在视口内。 */
    const openContextMenu = (event, calendarEvent) => {
        event.preventDefault();
        void editor.saveEditor();
        editor.closeEditor();
        setContextMenu({
            calendarEvent,
            left: Math.max(VIEWPORT_OFFSET, Math.min(event.clientX + VIEWPORT_OFFSET,
                window.innerWidth - MENU_WIDTH - VIEWPORT_OFFSET)),
            top: Math.max(VIEWPORT_OFFSET, Math.min(event.clientY + VIEWPORT_OFFSET,
                window.innerHeight - MENU_HEIGHT - VIEWPORT_OFFSET)),
        });
    };
    return {
        scheduleEvents: events.scheduleEvents,
        contextMenu, setContextMenu, ...editor,
        updateTime: events.updateTime, deleteEvent, openContextMenu,
    };
}

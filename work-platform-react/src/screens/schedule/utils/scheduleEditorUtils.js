/**
 * 将编辑草稿应用到日历事件。
 *
 * @param {Object} event FullCalendar 事件
 * @param {Object} editor 编辑草稿
 */
export function applyEditorToEvent(event, editor) {
    event.setProp("title", editor.title.trim() || "未命名日程");
    event.setStart(editor.timeRange[0].toDate());
    event.setEnd(editor.timeRange[1].toDate());
    event.setExtendedProp("description", editor.description);
    event.setExtendedProp("projectId", editor.projectId);
    event.setExtendedProp("checklistId", editor.checklistId);
}

/**
 * 请求失败后恢复事件原有的内容、时间及颜色。
 *
 * @param {Object} event FullCalendar 事件
 * @param {Object} originalEvent 编辑前快照
 */
export function restoreEditorEvent(event, originalEvent) {
    ["title", "backgroundColor", "borderColor", "textColor"].forEach((name) => {
        event.setProp(name, originalEvent[name]);
    });
    event.setStart(originalEvent.start);
    event.setEnd(originalEvent.end);
    ["description", "projectId", "checklistId"].forEach((name) => {
        event.setExtendedProp(name, originalEvent[name]);
    });
}

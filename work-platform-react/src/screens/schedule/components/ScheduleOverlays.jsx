import {Button, Checkbox, DatePicker, Input, TreeSelect} from "antd";
import ProjectBrowser from "../../../components/public/projectBrowser";

/**
 * 日程编辑浮层。
 *
 * @param {Object} props 编辑器参数
 * @param {Object} props.editor 当前日程编辑器状态
 * @param {Object|undefined} props.checklist 当前日程关联的清单
 * @param {Array} props.checklistTypeTree 清单类型树
 * @param {Array} props.projectOptions 可选项目列表
 * @param {Function} props.onChange 更新编辑器状态的回调
 * @param {Function} props.onSave 保存日程的回调
 * @param {Function} props.onToggleChecklistState 切换清单完成状态的回调
 * @returns {JSX.Element} 编辑器
 */
export const ScheduleEventEditor = ({
    editor,
    checklist,
    checklistTypeTree,
    projectOptions,
    onChange,
    onSave,
    onToggleChecklistState,
}) => {
    const selectedProject = projectOptions.find((item) => item.value === editor.projectId);
    const update = (value) => onChange((current) => ({...current, ...value}));

    return (
        <div className="schedule-event-editor" style={{left: editor.left, top: editor.top}}
             onClick={(event) => event.stopPropagation()}>
            <div className="schedule-event-editor-heading">
                {!editor.isNew && checklist && <Checkbox
                    checked={checklist.isDone === 1}
                    aria-label="清单已完成"
                    onChange={(event) => onToggleChecklistState(checklist.id, event.target.checked)}
                />}
                <Input
                    className="schedule-event-editor-title"
                    value={editor.title}
                    placeholder="日程名称"
                    onChange={(event) => update({title: event.target.value})}
                />
            </div>
            <DatePicker.RangePicker
                className="schedule-event-editor-field"
                value={editor.timeRange}
                showTime={{format: "HH:mm"}}
                format="YYYY-MM-DD HH:mm"
                onChange={(timeRange) => timeRange && update({timeRange})}
            />
            <div className="schedule-event-project-field">
                <span>关联项目：</span>
                <ProjectBrowser
                    value={selectedProject ? {id: selectedProject.value, name: selectedProject.label} : null}
                    style={{width: "100%"}}
                    onChange={(project) => update({projectId: project?.id})}
                />
            </div>
            {(editor.isNew || checklist) && <div className="schedule-event-project-field">
                <span>清单类型：</span>
                <TreeSelect
                    allowClear
                    className="schedule-event-editor-type"
                    value={editor.checklistTypeId}
                    placeholder="收集箱"
                    treeData={checklistTypeTree}
                    treeDefaultExpandAll
                    onChange={(value) => update({checklistTypeId: value})}
                />
            </div>}
            <Input.TextArea className="schedule-event-editor-field" value={editor.description} placeholder="日程描述"
                            onChange={(event) => update({description: event.target.value})}/>
            {editor.isNew && (
                <Button type="primary" className="schedule-event-editor-confirm" onClick={onSave}>确定</Button>
            )}
        </div>
    );
};

/**
 * 日程选择预览、右键菜单和事件编辑浮层。
 *
 * @param {Object} props 浮层参数
 * @param {Object|null} props.selectionPreview 拖动选择的时间范围预览
 * @param {Object} props.schedule 日程状态与操作
 * @param {Object|undefined} props.checklist 当前日程关联的清单
 * @param {Array} props.checklistTypeTree 清单类型树
 * @param {Array} props.projectOptions 可选项目列表
 * @param {Function} props.onToggleChecklistState 切换清单完成状态的回调
 * @returns {JSX.Element} 日程浮层集合
 */
export const ScheduleOverlays = ({
    selectionPreview,
    schedule,
    checklist,
    checklistTypeTree,
    projectOptions,
    onToggleChecklistState,
}) => (
    <>
        {selectionPreview && (
            <div className="schedule-selection-time-preview"
                 style={{left: selectionPreview.left, top: selectionPreview.top}}>
                {selectionPreview.start.format("MM-DD HH:mm")} - {selectionPreview.end.format("MM-DD HH:mm")}
            </div>
        )}
        {schedule.contextMenu && (
            <div className="schedule-event-context-menu"
                 style={{left: schedule.contextMenu.left, top: schedule.contextMenu.top}}
                 onClick={(event) => event.stopPropagation()}>
                <Button type="text" danger size="small" onClick={() => void schedule.deleteEvent()}>删除日程</Button>
            </div>
        )}
        {schedule.eventEditor && <ScheduleEventEditor
            editor={schedule.eventEditor}
            checklist={checklist}
            checklistTypeTree={checklistTypeTree}
            projectOptions={projectOptions}
            onChange={schedule.setEventEditor}
            onSave={() => void schedule.saveEditor(true)}
            onToggleChecklistState={onToggleChecklistState}
        />}
    </>
);

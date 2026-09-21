import {BarChartOutlined, PieChartOutlined} from "@ant-design/icons";
import {Button, DatePicker, Input, Modal} from "antd";
import ProjectBrowser from "../../../components/public/projectBrowser";
import {getProjectTimeStatisticsTitle} from "../utils/scheduleUtils";
import {ProjectTimeStatisticsContent} from "./ScheduleStatistics";
import HiddenTimeRangeModal from "./HiddenTimeRangeModal";

/**
 * 日程编辑浮层。
 *
 * @param {{editor: Object, projectOptions: Array, onChange: Function, onSave: Function}} props 编辑器参数
 * @param {Object} props.editor 当前日程编辑器状态
 * @param {Array} props.projectOptions 可选项目列表
 * @param {Function} props.onChange 更新编辑器状态的回调
 * @param {Function} props.onSave 保存日程的回调
 * @returns {JSX.Element} 编辑器
 */
export const ScheduleEventEditor = ({editor, projectOptions, onChange, onSave}) => {
    const selectedProject = projectOptions.find((item) => item.value === editor.projectId);
    const update = (value) => onChange((current) => ({...current, ...value}));

    return (
        <div className="schedule-event-editor" style={{left: editor.left, top: editor.top}}
             onClick={(event) => event.stopPropagation()}>
            <Input
                className="schedule-event-editor-title"
                value={editor.title}
                placeholder="日程名称"
                onChange={(event) => update({title: event.target.value})}
            />
            <DatePicker.RangePicker
                className="schedule-event-editor-field"
                value={editor.timeRange}
                showTime={{format: "HH:mm"}}
                format="YYYY-MM-DD HH:mm"
                onChange={(timeRange) => timeRange && update({timeRange})}
            />
            {!editor.checklistId && (
                <div className="schedule-event-project-field">
                    <span>项目：</span>
                    <ProjectBrowser value={selectedProject ? {id: selectedProject.value, name: selectedProject.label} : null}
                                    style={{width: "100%"}}
                                    onChange={(project) => update({projectId: project?.id})}/>
                </div>
            )}
            <Input.TextArea className="schedule-event-editor-field" value={editor.description} placeholder="日程描述"
                            onChange={(event) => update({description: event.target.value})}/>
            {editor.isNew && (
                <Button type="primary" className="schedule-event-editor-confirm" onClick={onSave}>确定</Button>
            )}
        </div>
    );
};

/**
 * 日程页面浮层和对话框。
 *
 * @param {Object} props 浮层参数
 * @param {Object|null} props.selectionPreview 拖动选择的时间范围预览
 * @param {Object|null} props.contextMenu 日程右键菜单状态
 * @param {Function} props.onDelete 删除日程的回调
 * @param {Object|null} props.editor 当前日程编辑器状态
 * @param {Array} props.projectOptions 可选项目列表
 * @param {Function} props.setEditor 更新编辑器状态的函数
 * @param {Function} props.onSaveEditor 保存编辑器内容的回调
 * @param {boolean} props.isHiddenRangeOpen 是否显示隐藏时间段对话框
 * @param {Array|null} props.hiddenRangeEditor 正在编辑的隐藏时间段
 * @param {Function} props.setHiddenRangeEditor 更新隐藏时间段的函数
 * @param {Function} props.onSaveHiddenRange 保存隐藏时间段的回调
 * @param {Function} props.onCloseHiddenRange 关闭隐藏时间段对话框的回调
 * @param {boolean} props.isStatisticsOpen 是否显示项目时间统计对话框
 * @param {Function} props.onCloseStatistics 关闭项目时间统计对话框的回调
 * @param {Array} props.statistics 项目时间统计数据
 * @param {number} props.totalHours 项目累计时长
 * @param {string} props.viewType 当前日历视图类型
 * @param {string} props.chartType 统计图类型
 * @param {Function} props.onChartTypeChange 切换统计图类型的回调
 * @returns {JSX.Element} 浮层集合
 */
export const ScheduleOverlays = ({
    selectionPreview,
    contextMenu,
    onDelete,
    editor,
    projectOptions,
    setEditor,
    onSaveEditor,
    isHiddenRangeOpen,
    hiddenRangeEditor,
    setHiddenRangeEditor,
    onSaveHiddenRange,
    onCloseHiddenRange,
    isStatisticsOpen,
    onCloseStatistics,
    statistics,
    totalHours,
    viewType,
    chartType,
    onChartTypeChange,
}) => (
    <>
        {selectionPreview && (
            <div className="schedule-selection-time-preview"
                 style={{left: selectionPreview.left, top: selectionPreview.top}}>
                {selectionPreview.start.format("MM-DD HH:mm")} - {selectionPreview.end.format("MM-DD HH:mm")}
            </div>
        )}
        {contextMenu && (
            <div className="schedule-event-context-menu" style={{left: contextMenu.left, top: contextMenu.top}}
                 onClick={(event) => event.stopPropagation()}>
                <Button type="text" danger size="small" onClick={onDelete}>删除日程</Button>
            </div>
        )}
        {editor && <ScheduleEventEditor editor={editor} projectOptions={projectOptions} onChange={setEditor}
                                        onSave={onSaveEditor}/>} 
        <HiddenTimeRangeModal
            open={isHiddenRangeOpen}
            value={hiddenRangeEditor}
            onChange={setHiddenRangeEditor}
            onSave={onSaveHiddenRange}
            onClose={onCloseHiddenRange}
        />
        <Modal
            className="schedule-project-time-modal"
            open={isStatisticsOpen}
            title={<div className="schedule-project-time-modal-title">
                <span>{getProjectTimeStatisticsTitle(viewType)}</span>
                <Button type="text" icon={chartType === "pie" ? <BarChartOutlined/> : <PieChartOutlined/>}
                        onClick={onChartTypeChange}/>
            </div>}
            footer={null}
            width={760}
            onCancel={onCloseStatistics}
        >
            <ProjectTimeStatisticsContent
                data={statistics}
                totalHours={totalHours}
                chartType={chartType}
                viewType={viewType}
                expanded
            />
        </Modal>
    </>
);

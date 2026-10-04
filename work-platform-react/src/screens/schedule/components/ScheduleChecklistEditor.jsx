import ScheduleApi from "../../../request/scheduleApi";
import ChecklistEditorModal from "../../checklist/ChecklistEditorModal";
import {toScheduleParam} from "../utils/scheduleUtils";

/**
 * 日程侧栏选中清单后的编辑界面。<br>
 * <p>负责把清单中的时间调整同步到关联日程。</p>
 *
 * @param {Object} props 编辑界面参数
 * @param {Object|null} props.checklist 当前选中的清单
 * @param {Array} props.projects 可选项目
 * @param {Array} props.typeTree 清单类型树
 * @param {Array} props.scheduleEvents 当前日程事件
 * @param {Function} props.onClose 关闭编辑界面
 * @param {Function} props.onChanged 数据变更后的刷新回调
 * @returns {JSX.Element} 清单编辑弹窗
 */
const ScheduleChecklistEditor = ({
    checklist,
    projects,
    typeTree,
    scheduleEvents,
    onClose,
    onChanged,
}) => {
    const updateScheduleTime = async (scheduleTimeId, range, checklistName) => {
        const event = scheduleEvents.find((item) => item.id === String(scheduleTimeId));
        if (!event) throw new Error("关联日程不存在，请刷新页面后重试");
        await ScheduleApi.updateSchedule(scheduleTimeId, {
            ...toScheduleParam({...event, start: range[0].toDate(), end: range[1].toDate()}),
            scheduleName: checklistName,
        });
        onChanged();
    };

    return (
        <ChecklistEditorModal
            open={Boolean(checklist)}
            checklist={checklist}
            projects={projects}
            typeTree={typeTree}
            onCancel={onClose}
            onChanged={onChanged}
            onUpdateScheduleTime={updateScheduleTime}
        />
    );
};

export default ScheduleChecklistEditor;

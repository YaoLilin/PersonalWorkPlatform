import {Checkbox, DatePicker, Form, Input, Modal, Select} from "antd";
import dayjs from "dayjs";
import {useContext, useEffect, useRef, useState} from "react";
import {ChecklistApi} from "../../request/checklistApi";
import {MessageContext} from "../../provider/MessageProvider";
import {flattenTypes} from "./checklistUtils";
import {checklistProjectBrowserStyle} from "./checklistFieldStyles";
import ProjectBrowser from "../../components/public/projectBrowser";

/**
 * <p>清单和日程页面共用的清单编辑弹窗，修改后自动保存。</p>
 *
 * @param {Object} props 组件参数
 * @param {boolean} props.open 是否展示弹窗
 * @param {Object|null} props.checklist 正在编辑的清单
 * @param {Array} props.projects 可关联项目
 * @param {Array} props.typeTree 清单类型树
 * @param {Function} props.onCancel 关闭弹窗回调
 * @param {Function} props.onChanged 数据变更后的回调
 * @param {Function} props.onUpdateScheduleTime 修改单个日程时间的回调
 * @returns {JSX.Element} 清单编辑弹窗
 */
const ChecklistEditorModal = ({open, checklist, projects, typeTree, onCancel, onChanged, onUpdateScheduleTime}) => {
    const messageApi = useContext(MessageContext);
    const [draft, setDraft] = useState(null);
    const [scheduleTimes, setScheduleTimes] = useState([]);
    const [isDone, setIsDone] = useState(false);
    const [savingState, setSavingState] = useState(false);
    const [savingTimeId, setSavingTimeId] = useState(null);
    const draftRef = useRef(null);
    const confirmedRef = useRef(null);
    const nameTimerRef = useRef(null);
    const saveQueueRef = useRef(Promise.resolve());
    const revisionRef = useRef(0);

    /**
     * 切换编辑目标时初始化字段，并清除上一个清单的待保存名称。
     */
    useEffect(() => {
        clearTimeout(nameTimerRef.current);
        const next = checklist ? {
            name: checklist.name,
            projectId: checklist.projectId ?? undefined,
            checklistTypeId: checklist.checklistTypeId ?? undefined,
        } : null;
        draftRef.current = next;
        confirmedRef.current = next;
        setDraft(next);
        setScheduleTimes(checklist?.scheduleTimes || []);
        setIsDone(checklist?.isDone === 1);
        return () => clearTimeout(nameTimerRef.current);
    }, [checklist?.id, open]);

    const saveInfo = (next) => {
        if (!checklist || !next.name.trim()) return saveQueueRef.current;
        const revision = ++revisionRef.current;
        saveQueueRef.current = saveQueueRef.current.then(async () => {
            await ChecklistApi.updateChecklist(checklist.id, {...next, name: next.name.trim()});
            confirmedRef.current = next;
            onChanged();
        }).catch((error) => {
            messageApi.error(error?.response?.data?.message || error?.message || "清单保存失败", 5);
            if (revision === revisionRef.current) {
                draftRef.current = confirmedRef.current;
                setDraft(confirmedRef.current);
            }
        });
        return saveQueueRef.current;
    };

    const flushName = () => {
        if (!nameTimerRef.current) return saveQueueRef.current;
        clearTimeout(nameTimerRef.current);
        nameTimerRef.current = null;
        return saveInfo(draftRef.current);
    };

    const changeField = (field, value) => {
        const next = {...draftRef.current, [field]: value};
        draftRef.current = next;
        setDraft(next);
        clearTimeout(nameTimerRef.current);
        nameTimerRef.current = null;
        if (field === "name") {
            if (value.trim()) nameTimerRef.current = setTimeout(() => {
                nameTimerRef.current = null;
                void saveInfo(draftRef.current);
            }, 500);
        } else {
            void saveInfo(next);
        }
    };

    const close = async () => {
        await flushName();
        if (!draftRef.current?.name.trim()) {
            draftRef.current = confirmedRef.current;
            setDraft(confirmedRef.current);
        }
        onCancel();
    };

    const updateTime = async (scheduleTime, range) => {
        if (!range?.[0] || !range?.[1] || !range[1].isAfter(range[0]) || !draftRef.current?.name.trim()) return;
        setSavingTimeId(scheduleTime.id);
        try {
            await flushName();
            await onUpdateScheduleTime(scheduleTime.id, range, draftRef.current.name.trim());
            setScheduleTimes((items) => items.map((item) => item.id === scheduleTime.id ? {
                ...item,
                date: range[0].format("YYYY-MM-DD"),
                startTime: range[0].format("HH:mm:ss"),
                endDate: range[1].format("YYYY-MM-DD"),
                endTime: range[1].format("HH:mm:ss"),
            } : item));
        } catch (error) {
            messageApi.error(error?.response?.data?.message || error?.message || "日程时间保存失败", 5);
        } finally {
            setSavingTimeId(null);
        }
    };

    const toggleDone = async (checked) => {
        setSavingState(true);
        try {
            await flushName();
            await ChecklistApi.updateChecklistState(checklist.id, checked ? 1 : 0);
            setIsDone(checked);
            onChanged();
        } catch (error) {
            messageApi.error(error?.response?.data?.message || error?.message || "清单状态保存失败", 5);
        } finally {
            setSavingState(false);
        }
    };

    return (
        <Modal
            title="编辑清单"
            open={open}
            onCancel={() => void close()}
            footer={<Checkbox
                checked={isDone}
                disabled={savingState}
                onChange={(event) => void toggleDone(event.target.checked)}
            >完成</Checkbox>}
        >
            {draft && <Form layout="vertical">
                <Form.Item label="名称" validateStatus={draft.name.trim() ? "" : "error"}
                           help={draft.name.trim() ? undefined : "请输入清单名称"}>
                    <Input
                        value={draft.name}
                        maxLength={255}
                        onChange={(event) => changeField("name", event.target.value)}
                        onBlur={() => void flushName()}
                    />
                </Form.Item>
                <Form.Item label="关联项目">
                    <ProjectBrowser
                        value={projects.find((project) => project.id === draft.projectId) || null}
                        style={checklistProjectBrowserStyle}
                        onChange={(project) => changeField("projectId", project?.id)}
                    />
                </Form.Item>
                <Form.Item label="清单类型">
                    <Select
                        allowClear
                        value={draft.checklistTypeId}
                        placeholder="未指定时归入收集箱"
                        options={flattenTypes(typeTree)}
                        onChange={(value) => changeField("checklistTypeId", value)}
                    />
                </Form.Item>
                <Form.Item label="日程时间">
                    {scheduleTimes.length ? <div style={{display: "grid", gap: 8}}>
                        {scheduleTimes.map((scheduleTime) => (
                            <DatePicker.RangePicker
                                key={scheduleTime.id}
                                value={[
                                    dayjs(`${scheduleTime.date}T${scheduleTime.startTime}`),
                                    dayjs(`${scheduleTime.endDate}T${scheduleTime.endTime}`),
                                ]}
                                showTime={{format: "HH:mm"}}
                                format="YYYY-MM-DD HH:mm"
                                style={{width: "100%"}}
                                disabled={savingTimeId === scheduleTime.id}
                                onChange={(range) => void updateTime(scheduleTime, range)}
                            />
                        ))}
                    </div> : "暂未创建日程"}
                </Form.Item>
            </Form>}
        </Modal>
    );
};

export default ChecklistEditorModal;

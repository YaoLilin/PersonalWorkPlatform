import {forwardRef, useContext, useImperativeHandle, useState} from "react";
import {DatePicker, Form, Input, Modal, TreeSelect} from "antd";
import {ChecklistApi} from "../../request/checklistApi";
import ScheduleApi from "../../request/scheduleApi";
import ProjectBrowser from "../../components/public/projectBrowser";
import {MessageContext} from "../../provider/MessageProvider";
import {checklistProjectBrowserStyle} from "./checklistFieldStyles";

/**
 * 新增清单弹窗，自行管理表单、可见状态和保存流程。
 *
 * @param {Object} props 弹窗参数
 * @param {Array} props.projects 可关联项目
 * @param {Array} props.typeTree 清单类型树
 * @param {Function} props.onCreated 创建成功后刷新列表
 * @param {Object} ref 提供 open(defaultTypeId) 打开弹窗并初始化默认类型
 * @returns {JSX.Element} 新增清单表单
 */
const ChecklistCreateModal = forwardRef(({projects, typeTree, onCreated}, ref) => {
    const messageApi = useContext(MessageContext);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const selectedProjectId = Form.useWatch("projectId", form);

    useImperativeHandle(ref, () => ({
        open: (checklistTypeId) => {
            form.setFieldsValue({name: "", projectId: undefined, scheduleTime: undefined, checklistTypeId});
            setOpen(true);
        },
    }), [form]);

    /** 创建带日程的清单，保留日程失败的专用提示。 */
    const createWithSchedule = async (values, [start, end]) => {
        if (!end.isAfter(start)) {
            messageApi.error("结束时间必须晚于开始时间");
            return false;
        }
        try {
            await ScheduleApi.createSchedule({
                projectId: values.projectId,
                checklistTypeId: values.checklistTypeId,
                createChecklist: true,
                scheduleName: values.name,
                date: start.format("YYYY-MM-DD"),
                endDate: end.format("YYYY-MM-DD"),
                startTime: start.format("HH:mm:ss"),
                endTime: end.format("HH:mm:ss"),
            });
            return true;
        } catch (error) {
            messageApi.error(`创建日程失败: ${error?.response?.data?.message || error?.message || "未知错误"}`);
            return false;
        }
    };

    /** 校验表单后创建普通清单或带日程的清单，成功后关闭并通知列表刷新。 */
    const save = async () => {
        try {
            const {scheduleTime, ...values} = await form.validateFields();
            const hasSchedule = Boolean(scheduleTime?.[0] && scheduleTime?.[1]);
            if (hasSchedule) {
                const created = await createWithSchedule(values, scheduleTime);
                if (!created) return;
            } else {
                await ChecklistApi.addChecklist(values);
            }
            messageApi.success("添加成功", 5);
            setOpen(false);
            onCreated();
        } catch (error) {
            if (!error?.errorFields) {
                messageApi.error(error?.response?.data?.message || error?.message || "清单保存失败");
            }
        }
    };

    return (
        <Modal
            title="添加清单"
            open={open}
            onCancel={() => setOpen(false)}
            onOk={save}
            okText="保存"
            cancelText="取消"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="名称" name="name" rules={[{required: true, message: "请输入清单名称"}]}>
                    <Input maxLength={255}/>
                </Form.Item>
                <Form.Item name="projectId" hidden><Input/></Form.Item>
                <Form.Item label="关联项目">
                    <ProjectBrowser
                        value={projects.find((project) => project.id === selectedProjectId) || null}
                        style={checklistProjectBrowserStyle}
                        onChange={(project) => form.setFieldValue("projectId", project?.id)}
                    />
                </Form.Item>
                <Form.Item label="清单类型" name="checklistTypeId">
                    <TreeSelect
                        allowClear
                        treeData={typeTree}
                        treeDefaultExpandAll
                        placeholder="未指定时归入收集箱"
                    />
                </Form.Item>
                <Form.Item label="日程时间" name="scheduleTime">
                    <DatePicker.RangePicker
                        showTime={{format: "HH:mm"}}
                        format="YYYY-MM-DD HH:mm"
                        style={{width: "100%"}}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default ChecklistCreateModal;

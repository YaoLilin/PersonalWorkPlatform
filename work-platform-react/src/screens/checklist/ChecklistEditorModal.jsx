import {Form, Input, Modal, Select} from "antd";
import {useContext, useEffect} from "react";
import {ChecklistApi} from "../../request/checklistApi";
import {MessageContext} from "../../provider/MessageProvider";
import {flattenTypes} from "./checklistUtils";

/**
 * <p>清单新增和编辑弹窗。</p>
 *
 * @param {Object} props 组件参数
 * @param {boolean} props.open 是否展示弹窗
 * @param {Object|null} props.checklist 正在编辑的清单，空值表示新增
 * @param {Array} props.projects 可关联项目
 * @param {Array} props.typeTree 清单类型树
 * @param {Function} props.onCancel 关闭弹窗回调
 * @param {Function} props.onSaved 保存成功后的回调
 * @returns {JSX.Element} 清单编辑弹窗
 */
const ChecklistEditorModal = ({open, checklist, projects, typeTree, onCancel, onSaved}) => {
    const [form] = Form.useForm();
    const messageApi = useContext(MessageContext);

    /**
     * 编辑目标或弹窗状态变化时，用对应数据初始化表单。
     */
    useEffect(() => {
        if (open) form.setFieldsValue(checklist || {name: "", projectId: undefined, checklistTypeId: undefined});
        else form.resetFields();
    }, [checklist, form, open]);

    const save = async () => {
        const values = await form.validateFields();
        if (checklist) {
            await ChecklistApi.updateChecklist(checklist.id, values);
            messageApi.success("保存成功", 5);
        } else {
            await ChecklistApi.addChecklist(values);
            messageApi.success("添加成功", 5);
        }
        onSaved({...checklist, ...values});
    };

    return (
        <Modal
            title={checklist ? "编辑清单" : "添加清单"}
            open={open}
            onCancel={onCancel}
            onOk={save}
            okText="保存"
            cancelText="取消"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="名称" name="name" rules={[{required: true, message: "请输入清单名称"}]}>
                    <Input maxLength={255}/>
                </Form.Item>
                <Form.Item label="关联项目" name="projectId">
                    <Select allowClear options={projects.map((project) => ({value: project.id, label: project.name}))}/>
                </Form.Item>
                <Form.Item label="清单类型" name="checklistTypeId">
                    <Select allowClear placeholder="未指定时归入收集箱" options={flattenTypes(typeTree)}/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChecklistEditorModal;

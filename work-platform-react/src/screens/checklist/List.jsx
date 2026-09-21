import React, {useContext, useMemo, useState} from "react";
import {Button, Card, Checkbox, Form, Input, Modal, Select, Tag} from "antd";
import {DeleteOutlined, FormOutlined, PlusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {useLoaderData, useRevalidator} from "react-router-dom";
import {ChecklistApi} from "../../request/checklistApi";
import {ProjectApi} from "../../request/projectApi";
import {MessageContext} from "../../provider/MessageProvider";
import TypeAddDialogContent from "../../components/type/TypeAddDialogContent";
import TypeEditDialogContent from "../../components/type/TypeEditDialogContent";
import ProjectTypePanel from "../project/ProjectTypePanel";
import {getParentTypeId, getTypeAndDescendantIds} from "../project/projectListUtils";
import {flattenTypes, getChecklistGroups} from "./checklistUtils";
import "../../components/project/project.css";
import "./checklist.css";

const {confirm} = Modal;

/**
 * <p>加载清单页面所需的清单、类型和项目数据。</p>
 *
 * @returns {Promise<Object>} 清单页面初始化数据
 */
export async function loader() {
    const [checklists, typeTree, projects] = await Promise.all([
        ChecklistApi.getChecklists(),
        ChecklistApi.getTypeTree(),
        ProjectApi.getProjects(),
    ]);
    return {checklists, typeTree, projects};
}

/**
 * <p>清单管理页面。</p>
 *
 * @returns {JSX.Element} 清单类型树和清单列表
 */
const ChecklistList = () => {
    const {checklists, typeTree, projects} = useLoaderData();
    const messageApi = useContext(MessageContext);
    const {revalidate} = useRevalidator();
    const [selectedTypeId, setSelectedTypeId] = useState("all");
    const [editingChecklist, setEditingChecklist] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [form] = Form.useForm();
    const selectedTypeIds = useMemo(() => selectedTypeId === "all" ? null
        : getTypeAndDescendantIds(typeTree, selectedTypeId), [selectedTypeId, typeTree]);
    const checklistGroups = useMemo(() => getChecklistGroups(checklists, typeTree, selectedTypeIds),
        [checklists, selectedTypeIds, typeTree]);

    /**
     * <p>重新加载清单页面数据。</p>
     */
    const refreshData = () => revalidate();

    /**
     * <p>选择清单类型。</p>
     */
    const selectType = (keys) => setSelectedTypeId(keys[0] || "all");

    /**
     * <p>新增清单类型。</p>
     */
    const showAddTypeDialog = (node) => {
        let name = "";
        confirm({
            title: "添加清单类型",
            icon: <PlusCircleOutlined/>,
            content: <TypeAddDialogContent onChange={(event) => name = event.target.value}/>,
            onOk: async () => {
                if (!name.trim()) {
                    return Promise.reject();
                }
                await ChecklistApi.addType({name, parentId: node?.key});
                messageApi.success("添加成功", 5);
                refreshData();
            },
        });
    };

    /**
     * <p>编辑清单类型。</p>
     */
    const showEditTypeDialog = (node) => {
        let name = node.title;
        let parentId = getParentTypeId(typeTree, node.key);
        let color = node.color;
        confirm({
            title: "编辑清单类型",
            icon: <FormOutlined/>,
            content: <TypeEditDialogContent
                name={name}
                parentNode={parentId}
                color={color}
                onNameChange={(event) => name = event.target.value}
                onNodeSelectorChanged={(value) => parentId = value}
                onColorChange={(value) => color = value}
            />,
            onOk: async () => {
                await ChecklistApi.updateType(node.key, {name, parentId, color});
                messageApi.success("保存成功", 5);
                refreshData();
            },
        });
    };

    /**
     * <p>删除当前清单类型。</p>
     */
    const deleteType = () => {
        if (selectedTypeId === "all") {
            return;
        }
        confirm({
            title: "确定要删除清单类型吗？",
            onOk: async () => {
                await ChecklistApi.deleteType(selectedTypeId);
                setSelectedTypeId("all");
                messageApi.success("删除成功", 5);
                refreshData();
            },
        });
    };

    /**
     * <p>移动清单类型到目标类型下。</p>
     */
    const moveType = async (info) => {
        if (info.node.key === "all") {
            return;
        }
        await ChecklistApi.updateType(info.dragNode.key, {
            name: info.dragNode.title,
            parentId: info.node.key,
            color: info.dragNode.color,
        });
        refreshData();
    };

    /**
     * <p>打开清单新增或编辑弹窗。</p>
     */
    const openChecklistModal = (checklist = null) => {
        setEditingChecklist(checklist);
        form.setFieldsValue(checklist || {
            name: "",
            projectId: undefined,
            checklistTypeId: selectedTypeId === "all" ? undefined : Number(selectedTypeId),
        });
        setIsCreateModalOpen(!checklist);
    };

    /**
     * <p>保存新增或编辑的清单。</p>
     */
    const saveChecklist = async () => {
        const values = await form.validateFields();
        if (editingChecklist) {
            await ChecklistApi.updateChecklist(editingChecklist.id, values);
            messageApi.success("保存成功", 5);
        } else {
            await ChecklistApi.addChecklist(values);
            messageApi.success("添加成功", 5);
        }
        setEditingChecklist(null);
        setIsCreateModalOpen(false);
        refreshData();
    };

    /**
     * <p>切换清单完成状态。</p>
     */
    const changeChecklistState = async (item, checked) => {
        await ChecklistApi.updateChecklistState(item.id, checked ? 1 : 0);
        refreshData();
    };

    /**
     * <p>删除指定清单。</p>
     */
    const deleteChecklist = (item) => {
        confirm({
            title: "确定要删除清单吗？",
            onOk: async () => {
                await ChecklistApi.deleteChecklist(item.id);
                messageApi.success("删除成功", 5);
                refreshData();
            },
        });
    };

    return (
        <div className="checklist-page">
            <ProjectTypePanel
                typeTree={typeTree}
                selectedTypeId={selectedTypeId}
                onSelectType={selectType}
                onMoveType={moveType}
                onAddType={showAddTypeDialog}
                onEditType={showEditTypeDialog}
                onDeleteType={deleteType}
            />
            <section className="checklist-list-panel">
                <div className="checklist-list-toolbar">
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => openChecklistModal()}>添加清单</Button>
                </div>
                <div className={`checklist-type-groups ${selectedTypeId === "all" ? "checklist-type-groups-all" : ""}`}>
                    {checklistGroups.map((group) => (
                        <Card
                            className="checklist-type-group"
                            key={group.id}
                            title={<><span className="checklist-type-color" style={{backgroundColor: group.color || "#1677FF"}}/>{group.name}</>}
                        >
                            {group.items.map((item) => (
                                <div className="checklist-item" key={item.id}>
                                    <Checkbox checked={item.isDone === 1}
                                              onChange={(event) => changeChecklistState(item, event.target.checked)}/>
                                    <span className={`checklist-item-name ${item.isDone === 1 ? "checklist-item-done" : ""}`}
                                          onClick={() => openChecklistModal(item)}>{item.name}</span>
                                    {item.projectName && <Tag>{item.projectName}</Tag>}
                                    <Button type="text" danger icon={<DeleteOutlined/>} onClick={() => deleteChecklist(item)}/>
                                </div>
                            ))}
                        </Card>
                    ))}
                </div>
            </section>
            <Modal
                title={editingChecklist ? "编辑清单" : "添加清单"}
                open={isCreateModalOpen || Boolean(editingChecklist)}
                onCancel={() => {
                    setEditingChecklist(null);
                    setIsCreateModalOpen(false);
                }}
                onOk={saveChecklist}
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
        </div>
    );
};

export default ChecklistList;

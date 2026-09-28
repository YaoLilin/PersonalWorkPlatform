import React, {useContext, useMemo, useState} from "react";
import {Button, DatePicker, Form, Input, Modal, TreeSelect} from "antd";
import {FormOutlined, PlusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {useLoaderData, useRevalidator} from "react-router-dom";
import {ChecklistApi} from "../../request/checklistApi";
import {ProjectApi} from "../../request/projectApi";
import ScheduleApi from "../../request/scheduleApi";
import ProjectBrowser from "../../components/public/projectBrowser";
import {MessageContext} from "../../provider/MessageProvider";
import TypeAddDialogContent from "../../components/type/TypeAddDialogContent";
import TypeEditDialogContent from "../../components/type/TypeEditDialogContent";
import ProjectTypePanel from "../project/ProjectTypePanel";
import {getParentTypeId, getTypeAndDescendantIds} from "../project/projectListUtils";
import {getChecklistGroups} from "./checklistUtils";
import CompletedChecklistModal from "./CompletedChecklistModal";
import ChecklistTypeCard from "./ChecklistTypeCard";
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
    const [completedScope, setCompletedScope] = useState(null);
    const [form] = Form.useForm();
    const selectedProjectId = Form.useWatch("projectId", form);
    const selectedTypeIds = useMemo(() => selectedTypeId === "all" ? null
        : getTypeAndDescendantIds(typeTree, selectedTypeId), [selectedTypeId, typeTree]);
    const checklistGroups = useMemo(() => getChecklistGroups(checklists, typeTree, selectedTypeIds),
        [checklists, selectedTypeIds, typeTree]);
    const completedChecklists = useMemo(() => checklists.filter((item) => item.isDone === 1), [checklists]);
    const completedModalChecklists = useMemo(() => completedScope?.typeId === undefined
        ? completedChecklists
        : completedChecklists.filter((item) => item.checklistTypeId === completedScope.typeId),
    [completedChecklists, completedScope]);

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
        let color = node?.color || "#1677FF";
        confirm({
            title: "添加清单类型",
            icon: <PlusCircleOutlined/>,
            content: <TypeAddDialogContent
                color={color}
                onChange={(event) => name = event.target.value}
                onColorChange={(value) => color = value}
            />,
            onOk: async () => {
                if (!name.trim()) {
                    return Promise.reject();
                }
                await ChecklistApi.addType({name, parentId: node?.key, color});
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
    const openChecklistModal = (checklist = null, group = null) => {
        setEditingChecklist(checklist);
        form.setFieldsValue(checklist ? {...checklist, scheduleTime: undefined} : {
            name: "",
            projectId: undefined,
            scheduleTime: undefined,
            checklistTypeId: group ? group.id : selectedTypeId === "all" ? undefined : Number(selectedTypeId),
        });
        setIsCreateModalOpen(!checklist);
    };

    /** 在指定类型卡片中新建清单。 */
    const addChecklistInGroup = (group) => openChecklistModal(null, group);

    /**
     * <p>保存新增或编辑的清单。</p>
     */
    const saveChecklist = async () => {
        try {
            const {scheduleTime, ...values} = await form.validateFields();
            if (editingChecklist) {
                await ChecklistApi.updateChecklist(editingChecklist.id, values);
                messageApi.success("保存成功", 5);
            } else if (scheduleTime?.[0] && scheduleTime?.[1]) {
                const [start, end] = scheduleTime;
                if (!end.isAfter(start)) {
                    messageApi.error("结束时间必须晚于开始时间");
                    return;
                }
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
                messageApi.success("添加成功", 5);
            } else {
                await ChecklistApi.addChecklist(values);
                messageApi.success("添加成功", 5);
            }
            setEditingChecklist(null);
            setIsCreateModalOpen(false);
            refreshData();
        } catch (error) {
            if (!error?.errorFields) {
                messageApi.error(error?.response?.data?.message || error?.message || "清单保存失败");
            }
        }
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

    /**
     * <p>打开全局或指定清单类型的已完成清单弹窗。</p>
     *
     * @param {Object} [group] 指定类型；不传时展示全部类型
     */
    const openCompletedModal = (group) => setCompletedScope(group
        ? {typeId: group.id, title: `${group.name} · 已完成清单`}
        : {typeId: undefined, title: "已完成清单"});

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
                    <Button
                        className="checklist-completed-trigger"
                        type="link"
                        onClick={() => openCompletedModal()}
                    >查看已完成</Button>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => openChecklistModal()}>添加清单</Button>
                </div>
                <div className={`checklist-type-groups ${selectedTypeId === "all" ? "checklist-type-groups-all" : ""}`}>
                    {checklistGroups.map((group) => (
                        <ChecklistTypeCard
                            key={group.id ?? "inbox"}
                            group={group}
                            onEdit={openChecklistModal}
                            onDelete={deleteChecklist}
                            onStateChange={changeChecklistState}
                            onViewAll={openCompletedModal}
                            onAddChecklist={addChecklistInGroup}
                        />
                    ))}
                </div>
            </section>
            <CompletedChecklistModal
                open={Boolean(completedScope)}
                title={completedScope?.title || "已完成清单"}
                checklists={completedModalChecklists}
                onClose={() => setCompletedScope(null)}
                onSelect={openChecklistModal}
            />
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
                    <Form.Item name="projectId" hidden><Input/></Form.Item>
                    <Form.Item label="关联项目">
                        <ProjectBrowser
                            value={projects.find((project) => project.id === selectedProjectId) || null}
                            style={{width: "100%"}}
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
                    {!editingChecklist && <Form.Item label="日程时间" name="scheduleTime">
                        <DatePicker.RangePicker
                            showTime={{format: "HH:mm"}}
                            format="YYYY-MM-DD HH:mm"
                            style={{width: "100%"}}
                        />
                    </Form.Item>}
                </Form>
            </Modal>
        </div>
    );
};

export default ChecklistList;

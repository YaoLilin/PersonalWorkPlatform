import React, {useContext, useRef, useState} from "react";
import {Modal} from "antd";
import {ExclamationCircleFilled, FormOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {useLoaderData, useRevalidator} from "react-router-dom";
import {ProjectApi} from "../../request/projectApi";
import {TypeApi} from "../../request/typeApi";
import ProjectListPanel from "./ProjectListPanel";
import ProjectFormModals from "./ProjectFormModals";
import ProjectTypePanel from "./ProjectTypePanel";
import {getParentTypeId} from "./projectListUtils";
import {MessageContext} from "../../provider/MessageProvider";
import TypeAddDialogContent from "../../components/type/TypeAddDialogContent";
import TypeEditDialogContent from "../../components/type/TypeEditDialogContent";
import "../../components/project/project.css";

const {confirm} = Modal;

/**
 * <p>获取项目及类型树数据。</p>
 *
 * @returns {Promise<{projects: Array, typeTree: Array}>} 项目和类型树
 */
export async function loader() {
    const [projects, typeTree] = await Promise.all([ProjectApi.getProjects(), TypeApi.getTypeTree({})]);
    return {projects, typeTree};
}

/**
 * <p>项目与类型管理页面。</p>
 *
 * @returns {JSX.Element} 类型树和项目列表
 */
const ProjectList = () => {
    const {projects, typeTree} = useLoaderData();
    const messageApi = useContext(MessageContext);
    const {revalidate} = useRevalidator();
    const [selectedTypeId, setSelectedTypeId] = useState("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [dataRefreshId, setDataRefreshId] = useState(0);
    const createProjectFormRef = useRef(null);
    const editProjectFormRef = useRef(null);

    /** <p>重新加载项目和类型数据，并通知列表清空项目选择。</p> */
    const refreshData = () => {
        setDataRefreshId((current) => current + 1);
        revalidate();
    };

    /** <p>切换类型并重置项目列表页码。</p> */
    const selectType = (keys) => {
        setSelectedTypeId(keys[0] || "all");
    };

    /** <p>新增项目并刷新数据。</p> */
    const createProject = (params) => {
        ProjectApi.addProject(params).then(() => {
            messageApi.success("添加成功", 5);
            setIsCreateModalOpen(false);
            refreshData();
        }).catch(() => messageApi.error("数据添加失败！", 5));
    };

    /** <p>保存项目编辑内容并刷新数据。</p> */
    const updateProject = (params) => {
        ProjectApi.updateProject(params.id, params).then(() => {
            messageApi.success("保存成功", 5);
            setEditingProject(null);
            refreshData();
        }).catch(() => messageApi.error("保存失败！", 5));
    };

    /** <p>新增类型并刷新数据。</p> */
    const addType = (name, parentId) => {
        if (!name) {
            return;
        }
        TypeApi.addType({name, parentId}).then(() => {
            messageApi.success("添加成功", 5);
            refreshData();
        }).catch(() => messageApi.error("添加失败", 5));
    };

    /** <p>更新类型并刷新数据。</p> */
    const updateType = (name, id, parentId, color) => {
        if (!name) {
            return;
        }
        TypeApi.updateType(id, {id, name, parentId, color}).then(() => {
            messageApi.success("更新成功", 5);
            refreshData();
        }).catch(() => messageApi.error("更新失败", 5));
    };

    /** <p>展示新增类型弹窗。</p> */
    const showAddTypeDialog = (node) => {
        let name = "";
        confirm({title: "添加类型", icon: <PlusCircleOutlined/>, content: <TypeAddDialogContent onChange={(event) => name = event.target.value}/>, onOk: () => addType(name, node?.key)});
    };

    /** <p>展示编辑类型弹窗。</p> */
    const showEditTypeDialog = (node) => {
        let name = node.title;
        let parentId = getParentTypeId(typeTree, node.key);
        let color = node.color;
        confirm({
            title: "编辑名称",
            icon: <FormOutlined/>,
            content: <TypeEditDialogContent
                name={name}
                parentNode={parentId}
                color={color}
                onNameChange={(event) => name = event.target.value}
                onNodeSelectorChanged={(value) => parentId = value}
                onColorChange={(value) => color = value}
            />,
            onOk: () => updateType(name, node.key, parentId, color),
        });
    };

    /** <p>确认后删除当前选中的类型。</p> */
    const deleteType = () => {
        if (selectedTypeId === "all") {
            return;
        }
        confirm({
            title: "确定要删除吗？",
            icon: <ExclamationCircleFilled/>,
            onOk: () => TypeApi.deleteType([selectedTypeId]).then(() => {
                messageApi.success("删除成功", 5);
                setSelectedTypeId("all");
                refreshData();
            }).catch(() => messageApi.error("删除失败", 5)),
        });
    };

    /** <p>将拖动的类型移动到目标类型下。</p> */
    const moveType = (info) => {
        if (info.node.key === "all") {
            return;
        }
        TypeApi.updateType(info.dragNode.key, {
            id: info.dragNode.key,
            name: info.dragNode.title,
            parentId: info.node.key,
            color: info.dragNode.color,
        }).then(refreshData).catch(() => messageApi.error("更新失败", 5));
    };

    return (
        <div className="project-page">
            <ProjectTypePanel
                typeTree={typeTree}
                selectedTypeId={selectedTypeId}
                onSelectType={selectType}
                onMoveType={moveType}
                onAddType={showAddTypeDialog}
                onEditType={showEditTypeDialog}
                onDeleteType={deleteType}
            />
            <ProjectListPanel
                projects={projects}
                typeTree={typeTree}
                selectedTypeId={selectedTypeId}
                onCreateProject={() => setIsCreateModalOpen(true)}
                onEditProject={setEditingProject}
                onRefreshData={refreshData}
                dataRefreshId={dataRefreshId}
            />
            <ProjectFormModals
                isCreateModalOpen={isCreateModalOpen}
                editingProject={editingProject}
                createProjectFormRef={createProjectFormRef}
                editProjectFormRef={editProjectFormRef}
                onCreateModalClose={() => setIsCreateModalOpen(false)}
                onEditModalClose={() => setEditingProject(null)}
                onCreateProject={createProject}
                onUpdateProject={updateProject}
            />
        </div>
    );
};

export default ProjectList;

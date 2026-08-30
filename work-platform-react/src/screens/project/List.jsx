import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {Button, Checkbox, DatePicker, Input, Modal, Pagination, Progress, Select, Table, Tag, Tree} from "antd";
import {useLoaderData, useRevalidator} from "react-router-dom";
import {ExclamationCircleFilled, FormOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {ProjectApi} from "../../request/projectApi";
import {TypeApi} from "../../request/typeApi";
import {MessageContext} from "../../provider/MessageProvider";
import {UserContext} from "../../provider/UserProvider";
import TypeAddDialogContent from "../../components/type/TypeAddDialogContent";
import TypeEditDialogContent from "../../components/type/TypeEditDialogContent";
import ProjectForm from "../../components/project/Form";
import "../../components/project/project.css";

const {confirm} = Modal;
const ONLY_CURRENT_TYPE_STORAGE_PREFIX = "project-only-current-type";
const DEFAULT_PROJECT_DATA = {
    name: "", type: "", progress: "", state: "", important: "", color: null, startDate: "", endDate: "", closeDate: "",
};
const PROJECT_STATE_ORDER = {1: 0, 0: 1, 2: 2};

/**
 * 获取当前用户“仅查看当前类型”设置的本地存储键。
 *
 * @param {string | undefined} userName 用户名
 * @returns {string} 本地存储键
 */
function getOnlyCurrentTypeStorageKey(userName) {
    return `${ONLY_CURRENT_TYPE_STORAGE_PREFIX}-${userName || "anonymous"}`;
}

/**
 * 获取当前用户保存的“仅查看当前类型”设置。
 *
 * @param {string | undefined} userName 用户名
 * @returns {boolean} 是否只查看当前类型
 */
function getOnlyCurrentTypeSetting(userName) {
    return localStorage.getItem(getOnlyCurrentTypeStorageKey(userName)) === "true";
}

/**
 * 获取项目及类型树数据。
 *
 * @returns {Promise<{projects: Array, typeTree: Array}>} 项目和类型树
 */
export async function loader() {
    const [projects, typeTree] = await Promise.all([ProjectApi.getProjects(), TypeApi.getTypeTree({})]);
    return {projects, typeTree};
}

/**
 * 获取类型节点的全部后代标识。
 *
 * @param {Array} types 类型节点列表
 * @returns {string[]} 后代类型标识
 */
function getDescendantTypeIds(types) {
    return types.flatMap((type) => [String(type.key), ...getDescendantTypeIds(type.children || [])]);
}

/**
 * 获取指定类型及其全部子类型的标识。
 *
 * @param {Array} types 类型树
 * @param {string | number} typeId 目标类型标识
 * @returns {string[]} 当前类型及其子类型标识
 */
function getTypeAndDescendantIds(types, typeId) {
    for (const type of types) {
        if (String(type.key) === String(typeId)) {
            return [String(type.key), ...getDescendantTypeIds(type.children || [])];
        }
        const matchedIds = getTypeAndDescendantIds(type.children || [], typeId);
        if (matchedIds.length > 0) {
            return matchedIds;
        }
    }
    return [];
}

/**
 * 查找指定类型的父类型标识。
 *
 * @param {Array} types 类型树
 * @param {string | number} typeId 类型标识
 * @param {string | number | null} parentId 父类型标识
 * @returns {string | number | null} 父类型标识
 */
function getParentTypeId(types, typeId, parentId = null) {
    for (const type of types) {
        if (String(type.key) === String(typeId)) {
            return parentId;
        }
        const matchedParentId = getParentTypeId(type.children || [], typeId, type.key);
        if (matchedParentId !== null) {
            return matchedParentId;
        }
    }
    return null;
}

/**
 * 比较两个项目指定字段的值。
 *
 * @param {Object} first 第一个项目
 * @param {Object} second 第二个项目
 * @param {string} field 排序字段
 * @returns {number} 比较结果
 */
function compareProjectField(first, second, field) {
    if (field === "startDate") {
        return (first.startDate || "").localeCompare(second.startDate || "");
    }
    return Number(first[field] || 0) - Number(second[field] || 0);
}

/**
 * 项目与类型管理页面。
 *
 * @returns {JSX.Element} 类型树和项目列表
 */
const ProjectList = () => {
    const {projects, typeTree} = useLoaderData();
    const messageApi = useContext(MessageContext);
    const {user} = useContext(UserContext);
    const {revalidate} = useRevalidator();
    const [selectedProjectIds, setSelectedProjectIds] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState("all");
    const [onlyCurrentType, setOnlyCurrentType] = useState(() => getOnlyCurrentTypeSetting(user?.name));
    const [searchConditions, setSearchConditions] = useState({
        name: "",
        startDate: null,
        endDate: null,
        important: undefined,
        state: undefined,
    });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectPagination, setProjectPagination] = useState({current: 1, pageSize: 50});
    const [projectSorter, setProjectSorter] = useState({field: null, order: null});
    const createProjectFormRef = useRef(null);
    const editProjectFormRef = useRef(null);
    const projectTableAreaRef = useRef(null);
    const [projectTableScrollHeight, setProjectTableScrollHeight] = useState(0);
    /**
     * 保存当前用户的类型筛选偏好，供下次进入页面时恢复。
     */
    useEffect(() => {
        localStorage.setItem(getOnlyCurrentTypeStorageKey(user?.name), String(onlyCurrentType));
    }, [onlyCurrentType, user?.name]);
    /**
     * 根据项目列表可用高度动态设置表格滚动区，使分页始终紧贴卡片底部。
     */
    useEffect(() => {
        const element = projectTableAreaRef.current;
        if (!element) {
            return undefined;
        }
        const updateHeight = () => setProjectTableScrollHeight(Math.max(0, element.clientHeight - 56));
        const resizeObserver = new ResizeObserver(updateHeight);
        updateHeight();
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
    }, []);
    const selectedTypeIds = useMemo(() => {
        if (selectedTypeId === "all") {
            return null;
        }
        return onlyCurrentType ? [String(selectedTypeId)] : getTypeAndDescendantIds(typeTree, selectedTypeId);
    }, [onlyCurrentType, selectedTypeId, typeTree]);
    const filteredProjects = useMemo(() => projects
        .filter((project) => !selectedTypeIds || selectedTypeIds.includes(String(project.typeId)))
        .filter((project) => {
            const {name, startDate, endDate, important, state} = searchConditions;
            if (name && !project.name.toLowerCase().includes(name.trim().toLowerCase())) {
                return false;
            }
            if ((startDate || endDate) && (!project.startDate
                || (startDate && project.startDate < startDate.format("YYYY-MM-DD"))
                || (endDate && project.startDate > endDate.format("YYYY-MM-DD")))) {
                return false;
            }
            return (important === undefined || project.important === important)
                && (state === undefined || project.state === state);
        })
        .sort((first, second) => {
            if (projectSorter.field && projectSorter.order) {
                const compareResult = compareProjectField(first, second, projectSorter.field);
                return projectSorter.order === "ascend" ? compareResult : -compareResult;
            }
            const stateDifference = (PROJECT_STATE_ORDER[first.state] ?? Number.MAX_SAFE_INTEGER)
                - (PROJECT_STATE_ORDER[second.state] ?? Number.MAX_SAFE_INTEGER);
            if (stateDifference !== 0) {
                return stateDifference;
            }
            return (second.startDate || "").localeCompare(first.startDate || "");
        })
        .map((project) => ({...project, key: project.id})), [projects, projectSorter, searchConditions, selectedTypeIds]);
    const selectedType = selectedTypeId === "all" ? null : selectedTypeId;
    const paginatedProjects = useMemo(() => {
        const startIndex = (projectPagination.current - 1) * projectPagination.pageSize;
        return filteredProjects.slice(startIndex, startIndex + projectPagination.pageSize);
    }, [filteredProjects, projectPagination]);

    const columns = [
        {title: "名称", dataIndex: "name", render: (text, record) => <a onClick={() => setEditingProject(record)}>{text}</a>},
        {
            title: "开始日期",
            dataIndex: "startDate",
            sorter: (first, second) => compareProjectField(first, second, "startDate"),
            sortOrder: projectSorter.field === "startDate" ? projectSorter.order : null,
        },
        {title: "结束日期", dataIndex: "endDate"},
        {title: "进度", dataIndex: "progress", render: (progress) => Number(progress) > 0 ? <Progress type="circle" size={48} percent={Number(progress)}/> : null},
        {title: "类型", dataIndex: "typeName"},
        {
            title: "是否重要",
            dataIndex: "important",
            sorter: (first, second) => compareProjectField(first, second, "important"),
            sortOrder: projectSorter.field === "important" ? projectSorter.order : null,
            render: (important) => <span>{important === 0 ? "不重要" : "重要"}</span>,
        },
        {
            title: "状态",
            dataIndex: "state",
            sorter: (first, second) => compareProjectField(first, second, "state"),
            sortOrder: projectSorter.field === "state" ? projectSorter.order : null,
            render: (state) => {
                const stateMap = {0: ["grey", "未开始"], 1: ["blue", "已开始"], 2: ["default", "已结束"]};
                const [color, name] = stateMap[state] || ["default", ""];
                return <Tag color={color}>{name}</Tag>;
            },
        },
    ];

    const refreshData = () => {
        setSelectedProjectIds([]);
        revalidate();
    };

    const selectType = (keys) => {
        const nextTypeId = keys[0] || "all";
        setSelectedTypeId(nextTypeId);
        setSelectedProjectIds([]);
        setProjectPagination((current) => ({...current, current: 1}));
    };

    const updateSearchCondition = (name, value) => {
        setSearchConditions((currentConditions) => ({...currentConditions, [name]: value}));
        setSelectedProjectIds([]);
        setProjectPagination((current) => ({...current, current: 1}));
    };

    const createProject = (params) => {
        ProjectApi.addProject(params).then(() => {
            messageApi.success("添加成功", 5);
            setIsCreateModalOpen(false);
            refreshData();
        }).catch(() => messageApi.error("数据添加失败！", 5));
    };

    const updateProject = (params) => {
        ProjectApi.updateProject(params.id, params).then(() => {
            messageApi.success("保存成功", 5);
            setEditingProject(null);
            refreshData();
        }).catch(() => messageApi.error("保存失败！", 5));
    };

    const deleteProjects = async () => {
        try {
            await ProjectApi.deleteProject(selectedProjectIds);
            messageApi.success("删除成功", 5);
            refreshData();
        } catch (error) {
            messageApi.error("删除失败", 5);
        }
    };

    const getProjectsWithRecords = async () => {
        const projectNames = [];
        for (const projectId of selectedProjectIds) {
            const result = await ProjectApi.existRecord(projectId);
            if (result.result) {
                const project = projects.find((item) => item.id === projectId);
                if (project) {
                    projectNames.push(project.name);
                }
            }
        }
        return projectNames.join(",");
    };

    const showDeleteProjectsConfirm = async () => {
        const projectNames = await getProjectsWithRecords();
        confirm({
            title: "提示",
            icon: <ExclamationCircleFilled/>,
            content: projectNames ? <div><p>以下项目在任务统计中存在记录，删除项目会同时清除任务统计记录。</p><p>{projectNames}</p></div> : "确定要删除吗？",
            onOk: deleteProjects,
        });
    };

    const addType = (name, parentId) => {
        if (!name) {
            return;
        }
        TypeApi.addType({name, parentId}).then(() => {
            messageApi.success("添加成功", 5);
            refreshData();
        }).catch(() => messageApi.error("添加失败", 5));
    };

    const updateType = (name, id, parentId, color) => {
        if (!name) {
            return;
        }
        TypeApi.updateType(id, {id, name, parentId, color}).then(() => {
            messageApi.success("更新成功", 5);
            refreshData();
        }).catch(() => messageApi.error("更新失败", 5));
    };

    const showAddTypeDialog = (node) => {
        let name = "";
        confirm({
            title: "添加类型",
            icon: <PlusCircleOutlined/>,
            content: <TypeAddDialogContent onChange={(event) => name = event.target.value}/>,
            onOk: () => addType(name, node?.key),
        });
    };

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

    const deleteType = () => {
        if (!selectedType) {
            return;
        }
        confirm({
            title: "确定要删除吗？",
            icon: <ExclamationCircleFilled/>,
            onOk: () => TypeApi.deleteType([selectedType]).then(() => {
                messageApi.success("删除成功", 5);
                setSelectedTypeId("all");
                refreshData();
            }).catch(() => messageApi.error("删除失败", 5)),
        });
    };

    const moveType = (info) => {
        if (info.node.key === "all") {
            return;
        }
        TypeApi.updateType(info.dragNode.key, {
            id: info.dragNode.key,
            name: info.dragNode.title,
            parentId: info.node.key,
            color: info.dragNode.color,
        })
            .then(refreshData).catch(() => messageApi.error("更新失败", 5));
    };

    const renderTypeTitle = (node) => {
        if (node.key === "all") {
            return node.title;
        }
        return (
            <div className="tree_title">
                <span className="project-type-color" style={{backgroundColor: node.color || "#1677FF"}}/>
                <span>{node.title}</span>
                <PlusCircleOutlined
                    className="tree_bt"
                    onClick={(event) => {
                        event.stopPropagation();
                        showAddTypeDialog(node);
                    }}
                />
                <FormOutlined
                    className="tree_bt"
                    onClick={(event) => {
                        event.stopPropagation();
                        showEditTypeDialog(node);
                    }}
                />
            </div>
        );
    };

    return (
        <div className="project-page">
            <aside className="project-type-panel">
                <div className="project-type-toolbar"><Button disabled={!selectedType} onClick={deleteType}>删除类型</Button><Button onClick={() => showAddTypeDialog()}>添加类型</Button></div>
                <Tree
                    className="project-type-tree"
                    blockNode
                    defaultExpandAll
                    draggable={{icon: false}}
                    selectedKeys={[selectedTypeId]}
                    onSelect={selectType}
                    onDrop={moveType}
                    treeData={[{key: "all", title: "全部", selectable: true, children: typeTree}]}
                    titleRender={renderTypeTitle}
                />
            </aside>
            <section className="project-list-panel">
                <div className="project-list-filters">
                    <Input allowClear placeholder="项目名称" value={searchConditions.name}
                           onChange={(event) => updateSearchCondition("name", event.target.value)}/>
                    <DatePicker
                        placeholder="开始日期"
                        value={searchConditions.startDate}
                        onChange={(value) => updateSearchCondition("startDate", value)}
                    />
                    <DatePicker
                        placeholder="结束日期"
                        value={searchConditions.endDate}
                        onChange={(value) => updateSearchCondition("endDate", value)}
                    />
                    <Select allowClear placeholder="是否重要" value={searchConditions.important}
                            options={[{value: 0, label: "不重要"}, {value: 1, label: "重要"}]}
                            onChange={(value) => updateSearchCondition("important", value)}/>
                    <Select allowClear placeholder="状态" value={searchConditions.state}
                            options={[{value: 0, label: "未开始"}, {value: 1, label: "已开始"}, {value: 2, label: "已结束"}]}
                            onChange={(value) => updateSearchCondition("state", value)}/>
                </div>
                <div className="project-list-toolbar"><Checkbox checked={onlyCurrentType} disabled={!selectedType} onChange={(event) => setOnlyCurrentType(event.target.checked)}>仅查看当前类型</Checkbox><div><Button onClick={() => setIsCreateModalOpen(true)}>添加</Button><Button type="primary" disabled={!selectedProjectIds.length} onClick={showDeleteProjectsConfirm}>删除</Button></div></div>
                <div className="project-list-table-area" ref={projectTableAreaRef}>
                    <Table
                        columns={columns}
                        dataSource={paginatedProjects}
                        rowSelection={{selectedRowKeys: selectedProjectIds, onChange: setSelectedProjectIds}}
                        scroll={projectTableScrollHeight ? {y: projectTableScrollHeight} : undefined}
                        pagination={false}
                        onChange={(pagination, filters, sorter) => setProjectSorter({
                            field: sorter.field || null,
                            order: sorter.order || null,
                        })}
                    />
                </div>
                <Pagination
                    className="project-list-pagination"
                    current={projectPagination.current}
                    pageSize={projectPagination.pageSize}
                    total={filteredProjects.length}
                    showSizeChanger
                    pageSizeOptions={["50", "100", "200"]}
                    showQuickJumper
                    onChange={(current, pageSize) => setProjectPagination({current, pageSize})}
                />
            </section>
            <Modal title="添加项目" open={isCreateModalOpen} destroyOnClose onCancel={() => setIsCreateModalOpen(false)} onOk={() => createProjectFormRef.current?.submit()} okText="保存" cancelText="取消" width={760}>
                <ProjectForm data={DEFAULT_PROJECT_DATA} type="create" onSubmit={createProject} hideNavigation hideSubmitButton onFormReady={(form) => createProjectFormRef.current = form}/>
            </Modal>
            <Modal title="编辑项目" open={Boolean(editingProject)} destroyOnClose onCancel={() => setEditingProject(null)} onOk={() => editProjectFormRef.current?.submit()} okText="保存" cancelText="取消" width={760}>
                {editingProject && <ProjectForm data={editingProject} type="edit" onSubmit={updateProject} hideNavigation hideSubmitButton onFormReady={(form) => editProjectFormRef.current = form}/>}
            </Modal>
        </div>
    );
};

export default ProjectList;

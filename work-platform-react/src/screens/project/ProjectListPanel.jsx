import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {Button, Checkbox, DatePicker, Input, Modal, Pagination, Progress, Select, Table, Tag} from "antd";
import {ExclamationCircleFilled} from "@ant-design/icons";
import {ProjectApi} from "../../request/projectApi";
import {MessageContext} from "../../provider/MessageProvider";
import {UserContext} from "../../provider/UserProvider";
import {
    compareProjectField,
    filterProjects,
    getOnlyCurrentTypeSetting,
    getOnlyCurrentTypeStorageKey,
    getTypeAndDescendantIds,
} from "./projectListUtils";

const {confirm} = Modal;

/**
 * <p>项目列表面板，管理项目筛选、排序、选择、分页和删除操作。</p>
 *
 * @param {Object} props 组件参数
 * @param {Array} props.projects 全部项目数据
 * @param {Array} props.typeTree 类型树数据
 * @param {string | number} props.selectedTypeId 当前选中的类型标识
 * @param {Function} props.onCreateProject 打开新增项目弹窗的回调
 * @param {Function} props.onEditProject 编辑项目的回调
 * @param {Function} props.onRefreshData 重新加载项目数据的回调
 * @param {number} props.dataRefreshId 数据刷新标识
 * @returns {JSX.Element} 项目列表面板
 */
const ProjectListPanel = ({
    projects,
    typeTree,
    selectedTypeId,
    onCreateProject,
    onEditProject,
    onRefreshData,
    dataRefreshId,
}) => {
    const messageApi = useContext(MessageContext);
    const {user} = useContext(UserContext);
    const [selectedProjectIds, setSelectedProjectIds] = useState([]);
    const [onlyCurrentType, setOnlyCurrentType] = useState(() => getOnlyCurrentTypeSetting(user?.name));
    const [searchConditions, setSearchConditions] = useState({
        name: "",
        startDate: null,
        endDate: null,
        important: undefined,
        state: undefined,
    });
    const [projectPagination, setProjectPagination] = useState({current: 1, pageSize: 50});
    const [projectSorter, setProjectSorter] = useState({field: null, order: null});
    const projectTableAreaRef = useRef(null);
    const [projectTableScrollHeight, setProjectTableScrollHeight] = useState(0);

    /** 保存当前用户的类型筛选偏好，供下次进入页面时恢复。 */
    useEffect(() => {
        localStorage.setItem(getOnlyCurrentTypeStorageKey(user?.name), String(onlyCurrentType));
    }, [onlyCurrentType, user?.name]);

    /** 当类型切换时，清空项目选择并返回第一页。 */
    useEffect(() => {
        setSelectedProjectIds([]);
        setProjectPagination((current) => ({...current, current: 1}));
    }, [selectedTypeId]);

    /** 父页面刷新数据后，清空已选择的项目。 */
    useEffect(() => {
        setSelectedProjectIds([]);
    }, [dataRefreshId]);

    /** 根据列表可用高度动态设置表格滚动区，使分页始终紧贴卡片底部。 */
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

    const selectedTypeIds = useMemo(() => selectedTypeId === "all" ? null
        : onlyCurrentType ? [String(selectedTypeId)] : getTypeAndDescendantIds(typeTree, selectedTypeId),
    [onlyCurrentType, selectedTypeId, typeTree]);
    const filteredProjects = useMemo(() => filterProjects(projects, selectedTypeIds, searchConditions, projectSorter),
        [projects, projectSorter, searchConditions, selectedTypeIds]);
    const paginatedProjects = useMemo(() => {
        const startIndex = (projectPagination.current - 1) * projectPagination.pageSize;
        return filteredProjects.slice(startIndex, startIndex + projectPagination.pageSize);
    }, [filteredProjects, projectPagination]);

    /**
     * <p>更新搜索条件并回到项目列表第一页。</p>
     */
    const updateSearchCondition = (name, value) => {
        setSearchConditions((currentConditions) => ({...currentConditions, [name]: value}));
        setSelectedProjectIds([]);
        setProjectPagination((current) => ({...current, current: 1}));
    };

    /**
     * <p>删除当前选中的项目。</p>
     */
    const deleteProjects = async () => {
        try {
            await ProjectApi.deleteProject(selectedProjectIds);
            messageApi.success("删除成功", 5);
            onRefreshData();
        } catch (error) {
            messageApi.error("删除失败", 5);
        }
    };

    /**
     * <p>展示删除项目确认弹窗。</p>
     */
    const showDeleteProjectsConfirm = async () => {
        const projectNames = [];
        for (const projectId of selectedProjectIds) {
            const result = await ProjectApi.existRecord(projectId);
            const project = projects.find((item) => item.id === projectId);
            if (result.result && project) {
                projectNames.push(project.name);
            }
        }
        confirm({
            title: "提示",
            icon: <ExclamationCircleFilled/>,
            content: projectNames.length
                ? <div><p>以下项目在任务统计中存在记录，删除项目会同时清除任务统计记录。</p><p>{projectNames.join(",")}</p></div>
                : "确定要删除吗？",
            onOk: deleteProjects,
        });
    };

    const columns = [
        {
            title: "名称",
            dataIndex: "name",
            render: (text, record) => <a onClick={() => onEditProject(record)}>{text}</a>,
        },
        {
            title: "开始日期",
            dataIndex: "startDate",
            sorter: (first, second) => compareProjectField(first, second, "startDate"),
            sortOrder: projectSorter.field === "startDate" ? projectSorter.order : null,
        },
        {title: "结束日期", dataIndex: "endDate"},
        {
            title: "进度",
            dataIndex: "progress",
            render: (progress) => Number(progress) > 0
                ? <Progress type="circle" size={48} percent={Number(progress)}/>
                : null,
        },
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

    return (
        <section className="project-list-panel">
            <div className="project-list-filters">
                <Input
                    allowClear
                    placeholder="项目名称"
                    value={searchConditions.name}
                    onChange={(event) => updateSearchCondition("name", event.target.value)}
                />
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
                <Select
                    allowClear
                    placeholder="是否重要"
                    value={searchConditions.important}
                    options={[{value: 0, label: "不重要"}, {value: 1, label: "重要"}]}
                    onChange={(value) => updateSearchCondition("important", value)}
                />
                <Select
                    allowClear
                    placeholder="状态"
                    value={searchConditions.state}
                    options={[
                        {value: 0, label: "未开始"},
                        {value: 1, label: "已开始"},
                        {value: 2, label: "已结束"},
                    ]}
                    onChange={(value) => updateSearchCondition("state", value)}
                />
            </div>
            <div className="project-list-toolbar">
                <Checkbox
                    checked={onlyCurrentType}
                    disabled={selectedTypeId === "all"}
                    onChange={(event) => setOnlyCurrentType(event.target.checked)}
                >
                    仅查看当前类型
                </Checkbox>
                <div>
                    <Button onClick={onCreateProject}>添加</Button>
                    <Button
                        type="primary"
                        disabled={!selectedProjectIds.length}
                        onClick={showDeleteProjectsConfirm}
                    >
                        删除
                    </Button>
                </div>
            </div>
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
    );
};

export default ProjectListPanel;

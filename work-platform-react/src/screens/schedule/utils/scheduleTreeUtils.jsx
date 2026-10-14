import {FolderOutlined} from "@ant-design/icons";
import {getMutedScheduleColor} from "./scheduleEventUtils";
import {INBOX_CHECKLIST_TYPE_KEY, INBOX_CHECKLIST_TYPE_NAME, INBOX_CHECKLIST_TYPE_COLOR} from "./scheduleConstants";

/**
 * 将项目放入类型树。
 *
 * @param {Array} types 类型树
 * @param {Array} projects 项目列表
 * @param {Object} projectColors 项目编号到有效颜色的映射
 * @returns {Array} 树节点
 */
export function toProjectTree(types, projects, projectColors = {}) {
    const toNode = (project) => ({
        key: `project-${project.id}`,
        title: <span className="schedule-project-item" data-project-id={project.id}
                     data-project-name={project.name} data-schedule-color={projectColors[project.id] || INBOX_CHECKLIST_TYPE_COLOR}>
            <span className="schedule-project-color" style={{backgroundColor: projectColors[project.id] || INBOX_CHECKLIST_TYPE_COLOR}}/>
            {project.name}
        </span>,
        isLeaf: true
    });
    // 保留类型层级，并把项目挂到对应类型；叶节点结束递归。
    const toTypes = (items) => items.map((type) => ({
        key: `type-${type.value}`,
        title: <span><FolderOutlined className="schedule-type-icon"/>{type.title}</span>,
        children: [...(type.children ? toTypes(type.children) : []), ...projects.filter((project) => project.typeId === type.value).map(toNode)]
    }));
    const uncategorized = projects.filter((project) => !project.typeId).map(toNode);
    return uncategorized.length ? [...toTypes(types), {
        key: "uncategorized-projects",
        title: "未分类项目",
        children: uncategorized
    }] : toTypes(types);
}

/**
 * 将清单放入清单类型树。
 *
 * @param {Array} types 清单类型树
 * @param {Array} checklists 清单列表
 * @param {Object} checklistTypeColors 清单编号到类型颜色的映射
 * @param {Object} projectColors 项目编号到有效颜色的映射
 * @returns {Array} 树节点
 */
export function toChecklistTree(types, checklists, checklistTypeColors = {}, projectColors = {}) {
    const toNode = (checklist) => {
        const color = projectColors[checklist.projectId] || checklistTypeColors[checklist.id] || INBOX_CHECKLIST_TYPE_COLOR;
        return {
            key: `checklist-${checklist.id}`,
            checklist,
            title: <span
                className="schedule-checklist-item"
                data-checklist-id={checklist.id}
                data-project-id={checklist.projectId || ""}
                data-schedule-name={checklist.name}
                data-schedule-color={checklist.isDone === 1 ? getMutedScheduleColor(color) : color}
                data-schedule-text-color={checklist.isDone === 1 ? "#262626" : "#fff"}
            >
                <span className="schedule-project-color" style={{backgroundColor: color}}/>
                {checklist.name}
            </span>,
            isLeaf: true,
        };
    };
    // 保留清单类型层级，并把清单挂到所属类型；叶节点结束递归。
    const toTypes = (items) => items.map((type) => ({
        key: `checklist-type-${type.value}`,
        title: <span><FolderOutlined className="schedule-type-icon"/>{type.title}</span>,
        children: [
            ...(type.children ? toTypes(type.children) : []),
            ...checklists
                .filter((checklist) => checklist.checklistTypeId === type.value)
                .map(toNode),
        ],
    }));
    const inboxChecklists = checklists.filter((checklist) => !checklist.checklistTypeId);
    const inboxNode = [{
        key: INBOX_CHECKLIST_TYPE_KEY,
        title: <span><FolderOutlined className="schedule-type-icon"/>{INBOX_CHECKLIST_TYPE_NAME}</span>,
        children: inboxChecklists.map(toNode),
    }];
    return [...inboxNode, ...toTypes(types)];
}

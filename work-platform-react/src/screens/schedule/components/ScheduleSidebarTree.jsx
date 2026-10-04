import {forwardRef, useImperativeHandle, useState} from "react";
import {Tabs, Tree} from "antd";
import {INBOX_CHECKLIST_TYPE_KEY} from "../utils/scheduleUtils";
import ScheduleChecklistEditor from "./ScheduleChecklistEditor";

/**
 * 获取清单树中初始展开的分类节点。
 *
 * @param {Array} nodes 清单树节点
 * @returns {Array<string>} 分类节点键值
 */
function getChecklistGroupKeys(nodes) {
    return nodes.flatMap((node) => node.isLeaf ? [] : [node.key, ...getChecklistGroupKeys(node.children || [])]);
}

/**
 * 日程侧栏中的清单与项目树。<br>
 * <p>自行管理当前标签、树的展开状态和清单选择；向日程创建流程提供展开收集箱的操作。</p>
 *
 * @param {Object} props 侧栏数据与回调
 * @param {Array} props.checklistTree 清单树
 * @param {Array} props.projectTree 项目树
 * @param {Array} props.projects 清单编辑器可选项目
 * @param {Array} props.checklistTypeTree 清单类型树
 * @param {Array} props.scheduleEvents 当前日程事件
 * @param {Function} props.onChanged 清单或日程变更后的刷新回调
 * @param {Object} ref 对外提供 expandInbox 方法
 * @returns {JSX.Element} 树及清单编辑界面
 */
const ScheduleSidebarTree = forwardRef(({
    checklistTree,
    projectTree,
    projects,
    checklistTypeTree,
    scheduleEvents,
    onChanged,
}, ref) => {
    const [activeTab, setActiveTab] = useState("checklists");
    const [expandedChecklistKeys, setExpandedChecklistKeys] = useState(() => getChecklistGroupKeys(checklistTree));
    const [editingChecklist, setEditingChecklist] = useState(null);

    useImperativeHandle(ref, () => ({
        expandInbox: () => setExpandedChecklistKeys((keys) => keys.includes(INBOX_CHECKLIST_TYPE_KEY)
            ? keys : [...keys, INBOX_CHECKLIST_TYPE_KEY]),
    }), []);

    const openChecklistEditor = (_, info) => {
        if (info.node.checklist) setEditingChecklist(info.node.checklist);
    };
    return (
        <>
            <div className="schedule-project-tree">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: "checklists",
                            label: "清单列表",
                            children: <Tree
                                treeData={checklistTree}
                                expandedKeys={expandedChecklistKeys}
                                onExpand={setExpandedChecklistKeys}
                                autoExpandParent={false}
                                blockNode
                                onSelect={openChecklistEditor}
                            />,
                        },
                        {
                            key: "projects",
                            label: "项目列表",
                            children: <Tree treeData={projectTree} defaultExpandAll blockNode/>,
                        },
                    ]}
                />
            </div>
            <ScheduleChecklistEditor
                checklist={editingChecklist}
                projects={projects}
                typeTree={checklistTypeTree}
                scheduleEvents={scheduleEvents}
                onClose={() => setEditingChecklist(null)}
                onChanged={onChanged}
            />
        </>
    );
});

export default ScheduleSidebarTree;

import React from "react";
import {Button, Tree} from "antd";
import {FormOutlined, PlusCircleOutlined} from "@ant-design/icons";

/**
 * <p>项目类型树面板。</p>
 *
 * @param {Object} props 组件参数
 * @param {Array} props.typeTree 类型树数据
 * @param {string | number} props.selectedTypeId 当前选中的类型标识
 * @param {Function} props.onSelectType 选择类型后的回调
 * @param {Function} props.onMoveType 拖动类型后的回调
 * @param {Function} props.onAddType 打开新增类型弹窗的回调
 * @param {Function} props.onEditType 打开编辑类型弹窗的回调
 * @param {Function} props.onDeleteType 删除当前类型的回调
 * @returns {JSX.Element} 类型树面板
 */
const ProjectTypePanel = ({
    typeTree,
    selectedTypeId,
    onSelectType,
    onMoveType,
    onAddType,
    onEditType,
    onDeleteType,
}) => {
    /**
     * <p>渲染带操作按钮的类型树节点标题。</p>
     */
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
                        onAddType(node);
                    }}
                />
                <FormOutlined
                    className="tree_bt"
                    onClick={(event) => {
                        event.stopPropagation();
                        onEditType(node);
                    }}
                />
            </div>
        );
    };

    return (
        <aside className="project-type-panel">
            <div className="project-type-toolbar">
                <Button disabled={selectedTypeId === "all"} onClick={onDeleteType}>删除类型</Button>
                <Button onClick={() => onAddType()}>添加类型</Button>
            </div>
            <Tree
                className="project-type-tree"
                blockNode
                defaultExpandAll
                draggable={{icon: false}}
                selectedKeys={[selectedTypeId]}
                onSelect={onSelectType}
                onDrop={onMoveType}
                treeData={[{key: "all", title: "全部", selectable: true, children: typeTree}]}
                titleRender={renderTypeTitle}
            />
        </aside>
    );
};

export default ProjectTypePanel;

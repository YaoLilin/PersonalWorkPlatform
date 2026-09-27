import {useState} from "react";
import {Button, Card, Checkbox, Tag} from "antd";
import {DeleteOutlined} from "@ant-design/icons";

const COMPLETED_PREVIEW_LIMIT = 20;

/**
 * <p>按类型展示未完成清单，并在卡片底部展开已完成清单预览。</p>
 *
 * @param {Object} props 组件参数
 * @param {Object} props.group 清单类型及其清单
 * @param {Function} props.onEdit 点击清单名称的回调
 * @param {Function} props.onDelete 删除清单的回调
 * @param {Function} props.onStateChange 修改清单状态的回调
 * @param {Function} props.onViewAll 查看该类型全部已完成清单的回调
 * @returns {JSX.Element} 清单类型卡片
 */
const ChecklistTypeCard = ({group, onEdit, onDelete, onStateChange, onViewAll}) => {
    const [completedExpanded, setCompletedExpanded] = useState(false);
    const activeItems = group.items.filter((item) => item.isDone !== 1);
    const completedItems = group.items.filter((item) => item.isDone === 1);

    return (
        <Card
            className="checklist-type-group"
            title={<>
                <span className="checklist-type-color" style={{backgroundColor: group.color || "#1677FF"}}/>
                {group.name}
            </>}
        >
            {activeItems.map((item) => (
                <div className="checklist-item" key={item.id}>
                    <Checkbox
                        checked={false}
                        onChange={(event) => onStateChange(item, event.target.checked)}
                    />
                    <span className="checklist-item-name" onClick={() => onEdit(item)}>{item.name}</span>
                    {item.projectName && <Tag>{item.projectName}</Tag>}
                    <Button type="text" danger icon={<DeleteOutlined/>} onClick={() => onDelete(item)}/>
                </div>
            ))}
            <div className="checklist-type-completed-section">
                <Button
                    type="link"
                    className="checklist-type-completed-trigger"
                    onClick={() => setCompletedExpanded((current) => !current)}
                >{completedExpanded ? "收起已完成" : "查看已完成"}</Button>
                {completedExpanded && <>
                    {completedItems.slice(0, COMPLETED_PREVIEW_LIMIT).map((item) => (
                        <div className="checklist-completed-item" key={item.id}>
                            <Button
                                type="text"
                                className="checklist-completed-name"
                                onClick={() => onEdit(item)}
                            >{item.name}</Button>
                        </div>
                    ))}
                    {completedItems.length === 0 && <span className="checklist-completed-empty">暂无已完成清单</span>}
                    {completedItems.length > 0 && <Button
                        type="link"
                        className="checklist-type-completed-all"
                        onClick={() => onViewAll(group)}
                    >查看全部</Button>}
                </>}
            </div>
        </Card>
    );
};

export default ChecklistTypeCard;

import {Input, Modal, Table} from "antd";
import {useMemo, useState} from "react";

const COLUMNS = [
    {title: "清单名称", dataIndex: "name", key: "name", render: (name) => <span className="checklist-completed-name">{name}</span>},
    {title: "清单类型", dataIndex: "checklistTypeName", key: "checklistTypeName"},
    {title: "关联项目", dataIndex: "projectName", key: "projectName", render: (name) => name || "—"},
];

/**
 * <p>展示并检索已完成清单，在弹窗内进行分页。</p>
 *
 * @param {Object} props 组件参数
 * @param {boolean} props.open 是否打开弹窗
 * @param {string} props.title 弹窗标题
 * @param {Array} props.checklists 已完成清单
 * @param {Function} props.onClose 关闭弹窗回调
 * @param {Function} props.onSelect 点击清单的回调
 * @returns {JSX.Element} 已完成清单弹窗
 */
const CompletedChecklistModal = ({open, title, checklists, onClose, onSelect}) => {
    const [nameQuery, setNameQuery] = useState("");
    const [pagination, setPagination] = useState({current: 1, pageSize: 50});
    const filteredChecklists = useMemo(() => {
        const query = nameQuery.trim().toLocaleLowerCase();
        return query ? checklists.filter((item) => item.name.toLocaleLowerCase().includes(query)) : checklists;
    }, [checklists, nameQuery]);

    const changeQuery = (event) => {
        setNameQuery(event.target.value);
        setPagination((current) => ({...current, current: 1}));
    };
    const close = () => {
        setNameQuery("");
        setPagination({current: 1, pageSize: 50});
        onClose();
    };
    const selectChecklist = (item) => {
        close();
        onSelect(item);
    };

    return (
        <Modal title={title} open={open} footer={null} width={760} onCancel={close}>
            <Input.Search
                allowClear
                value={nameQuery}
                placeholder="按清单名称搜索"
                onChange={changeQuery}
            />
            <Table
                className="checklist-completed-table"
                rowKey="id"
                columns={COLUMNS}
                dataSource={filteredChecklists}
                pagination={{...pagination, showSizeChanger: true, pageSizeOptions: ["50", "100"]}}
                onChange={(next) => setPagination({current: next.current, pageSize: next.pageSize})}
                onRow={(item) => ({onClick: () => selectChecklist(item)})}
            />
        </Modal>
    );
};

export default CompletedChecklistModal;

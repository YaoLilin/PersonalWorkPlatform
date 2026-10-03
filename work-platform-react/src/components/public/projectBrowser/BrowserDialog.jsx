import {Modal, Table} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {ProjectApi} from "../../../request/projectApi";
import ConditionPanel from "./ConditonPanel";
import {MessageContext} from "../../../provider/MessageProvider";
import PropTypes from "prop-types";

const columns = [
    {
        title: '名称',
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: '类型',
        dataIndex: 'type',
        key: 'type'
    },
]

/**
 * 项目浏览列表弹窗。
 *
 * @param {Object} props 组件参数
 * @param {Function} props.onClickRow 单选时选中项目的回调
 * @param {Function} props.onCancel 关闭回调
 * @param {Function} props.onOk 多选确认回调
 * @param {boolean} props.visible 是否显示
 * @param {boolean} props.isMultiple 是否多选
 * @param {number[]} props.selectedProjectIds 已选项目编号
 * @param {Function} props.onSelectedKeysChange 多选项目变化回调
 * @returns {JSX.Element} 项目列表弹窗
 */
const BrowserDialog =({onClickRow,onCancel,onOk,visible,isMultiple,selectedProjectIds,onSelectedKeysChange}) => {
    const [tableData, setTableData] = useState([]);
    const [totalProjectData, setTotalProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedData, setSelectedData] = useState([]);

    const messageApi = useContext(MessageContext);

    /** 每次打开浏览框时刷新项目，确保编辑后的名称立即可见。 */
    useEffect(() => {
        if (!visible) return;
        setIsLoading(true);
        ProjectApi.getProjects({}).then(result => {
            const dataSource = result.map(i => ({key: i.id, name: i.name, type: i.typeName, typeId: i.typeId}));
            setTableData(dataSource);
            setTotalProjectData(dataSource);
            setIsLoading(false);
        }).catch(e =>{
            messageApi.error("获取项目数据失败");
            setIsLoading(false);
        })
    }, [messageApi, visible]);

    const searchTable = (value, type) => {
        const newData = totalProjectData.filter(item =>
            (value ? item.name.toLowerCase().includes(value.toLowerCase()) : true) &&
            (type ? item.typeId === type : true)
        );
        setTableData(newData);
    }

    const handleClickRow = !isMultiple ? (record) => {
        return {
            onClick: () => onClickRow(record.key, record.name)
        }
    } : null;

    const rowSelection = isMultiple ? {
        onChange: (selectedRowKeys) => {
            onSelectedKeysChange(selectedRowKeys);
            const selectedData = totalProjectData.filter(item => selectedRowKeys.includes(item.key));
            setSelectedData(selectedData);
        },
        selectedRowKeys: selectedProjectIds,
    } : null;

    return (
        <Modal title="选择项目"
               onOk={()=> onOk(selectedData)}
               open={visible}
               onCancel={onCancel}
               width={600}
               style={{top: 24}}>
            <ConditionPanel onChange={(name, type) => searchTable(name, type)}/>
            <Table columns={columns}
                   dataSource={tableData}
                   pagination={{position: ['bottomRight']}}
                   scroll={{y: 'max(120px, calc(100vh - 360px))'}}
                   loading={isLoading}
                   style={{paddingTop:10}}
                   rowSelection={rowSelection}
                   onRow={handleClickRow}
            />
        </Modal>
    )
}
BrowserDialog.defaultProps = {
    onSelected: ()=>{},
    onCancel: ()=>{},
    onOk: ()=>{},
    visible: false
}
BrowserDialog.prototype={
    onSelected:PropTypes.func,
    onCancel: PropTypes.func,
    onOk:PropTypes.func,
    visible:PropTypes.bool
}

export default BrowserDialog;

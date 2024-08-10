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

const BrowserDialog =({onClickRow,onCancel,onOk,visible,isMultiple,selectedProjectIds,onSelectedKeysChange}) => {
    const [tableData, setTableData] = useState([]);
    const [totalProjectData, setTotalProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedData, setSelectedData] = useState([]);

    const messageApi = useContext(MessageContext);

    useEffect(() => {
        ProjectApi.getProjects({}).then(result => {
            const dataSource = result.map(i => ({key: i.id, name: i.name, type: i.typeName, typeId: i.typeId}));
            setTableData(dataSource);
            setTotalProjectData(dataSource);
            setIsLoading(false);
        }).catch(e =>{
            messageApi.error("获取项目数据失败");
            setIsLoading(false);
        })
    }, [messageApi]);

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
               width={600}>
            <ConditionPanel onChange={(name, type) => searchTable(name, type)}/>
            <Table columns={columns}
                   dataSource={tableData}
                   pagination={{position: ['bottomRight']}}
                   isLoading={isLoading}
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
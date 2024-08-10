import {Button, DatePicker, Modal} from "antd";
import React, {useContext, useState} from "react";
import {ProblemsApis} from "../../request/problemApi";
import {useLoaderData} from "react-router-dom";
import {ExclamationCircleFilled} from "@ant-design/icons";
import ConditionPanel from "../../components/problems/ConditionPanel";
import ProblemsTable from "../../components/problems/Table";
import {MessageContext} from "../../provider/MessageProvider";
import useProblemEditDialog from "./useProblemEditDialog";
import handleLoaderError from "../../util/handleLoaderError";
const {confirm} = Modal;

export async function loader({params}) {
    try {
        return await ProblemsApis.list(params);
    } catch (e) {
        handleLoaderError(e);
    }
}

// 问题库页面
const ProblemList = () => {
    const data = useLoaderData();
    data.forEach(i => i.key = i.id);
    const condition = {};
    const refreshTableData = async () => {
        const data = await ProblemsApis.list(condition);
        data.forEach(i => {
            i.key = i.id;
        });
        setTableData(data);
    }
    const [canDelete, setCanDelete] = useState(false);
    const [tableData, setTableData] = useState(data);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const {dialog,setEditDialogType,setEditDialogData,setEditDialogOpen} = useProblemEditDialog(refreshTableData);
    const messageApi = useContext(MessageContext);

    const handleDelete = () => {
        confirm({
            title: '警告',
            content: '确定要删除吗？',
            icon: <ExclamationCircleFilled/>,
            onOk: () => {
                ProblemsApis.deleteProblems(selectedRowKeys).then(result => {
                    refreshTableData();
                }).catch(e => messageApi.error("删除失败",5));
            }
        })
    }

    const handleSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setCanDelete(newSelectedRowKeys.length > 0);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: handleSelectChange,
    };

    // 点击表格里的标题列时，获取当前行的数据赋值给问题编辑对话框，并打开问题编辑对话框
    const handleClickTableTitle = (data) => {
        setEditDialogOpen(true);
        setEditDialogData(data);
        setEditDialogType("update")
    }

    const updateProblemState = (id,state) =>{
        setTableData(tableData.map(i =>{
            if (i.id === id) {
                i.state = state;
            }
            return i;
        }));
    }
    const tableOperation = async (id, type) => {
        try {
            if (type === 0) {
                await ProblemsApis.done(id);
                updateProblemState(id, 1);
            } else {
                await ProblemsApis.callback(id);
                updateProblemState(id, 0);
            }
        } catch (e) {
            messageApi.error("操作失败", 5);
        }
    }

    const handleConditionChange = (data) => {
        if (data.dateRange) {
            condition.startDate = data.dateRange[0].format('YYYY-MM-DD');
            condition.endDate = data.dateRange[1].format('YYYY-MM-DD');
        } else {
            condition.startDate = null;
            condition.endDate = null;
        }
        condition.state = data.state;
        condition.level = data.level;
        if (data.week){
            condition.weekNumber = data.week.year() + '' + data.week.week();
        }else {
            condition.weekNumber = null;
        }
        refreshTableData();
    }

    return (
        <div>
            {dialog}
            <ConditionPanel style={{float: 'left'}}
                            onChange={handleConditionChange}
            />
            <div style={{float: 'right'}}>
                <Button type={"primary"} onClick={() => {
                    setEditDialogOpen(true);
                    setEditDialogData({});
                    setEditDialogType("add")
                }}>添加</Button>
                <Button style={{marginLeft: 10}} disabled={!canDelete} onClick={handleDelete}>删除</Button>
            </div>
            <div style={{paddingTop: 20, clear: 'both'}}>
                <ProblemsTable dataSource={tableData}
                               onClickTitle={handleClickTableTitle}
                               rowSelection={rowSelection}
                               tableOperation={tableOperation}/>
            </div>
        </div>
    )
}

export default ProblemList;
import React, {useContext, useState} from "react";
import {Button, message, Modal, Progress, Table, Tag} from 'antd';
import {useLoaderData, useNavigate} from "react-router-dom";
import {ProjectApi} from "../../request/projectApi";
import {ExclamationCircleFilled} from "@ant-design/icons";
import {MessageContext} from "../../provider/MessageProvider";
import handleLoaderError from "../../util/handleLoaderError";

const { confirm } = Modal;

export async function loader({params}){
    try {
        return await ProjectApi.getProjects(params);
    } catch (e) {
        handleLoaderError(e);
    }
}

const ProjectList = () => {
    const data = useLoaderData();
    if (data) {
        data.forEach(i=>{
            i.key = i.id;
        })
    }
    const messageApi = useContext(MessageContext);
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            render: (text,record) =>{
                return <a onClick={()=>navigate('/project/'+record.id)}>{text}</a>
            } ,
        },
        {
            title: '开始日期',
            dataIndex: 'startDate',
        },
        {
            title: '结束日期',
            dataIndex: 'endDate',
        },
        {
            title: '进度',
            dataIndex: 'progress',
            render:(data)=>{
                return <Progress percent={data}/>
            }
        },
        {
            title: '类型',
            dataIndex: 'typeName',
        },
        {
            title: '是否重要',
            dataIndex: 'important',
            render:(data,text)=>{
                const name = data === 0 ?'不重要':'重要';
                return <span>{name}</span>
            }
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (data) => {
                let color = data === 0 ? 'grey' : 'blue';
                let name = '';
                if (data === 0) {
                    name = '未开始';
                }else if (data === 1) {
                    name = '已开始';
                }else if (data === 2) {
                    name = '已结束'
                }
                return (
                    <Tag color={color} key={data}>
                        {name}
                    </Tag>
                );
            }
        },
    ];
    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    function deleteProject(selectedRowKeys) {
        ProjectApi.deleteProject(selectedRowKeys).then(result=>{
            messageApi.success('删除成功',5);
            navigate('/projects')
        }).catch(error=>{
            messageApi.error( '删除失败!');
        });
    }
    const onDelete = async ()=>{
        let existRecordProjectName = await fetchExistRecordProjectName();
        if (existRecordProjectName.length > 0) {
            confirm({
                title: '提示',
                icon: <ExclamationCircleFilled />,
                content: <div>
                    <p>以下项目在任务统计中存在记录，如果删除项目则会清除任务统计记录，请确认是否删除项目。</p>
                    <p>{existRecordProjectName}</p>
                </div>,
                onOk() {
                    deleteProject(selectedRowKeys)
                }
            });
            return;
        }
        confirm({
            title: '提示',
            icon: <ExclamationCircleFilled />,
            content: '确定要删除吗？',
            onOk() {
                deleteProject(selectedRowKeys);
            }
        });
    }
    async function fetchExistRecordProjectName() {
        // 查找要删除的项目中是否存在统计记录
        let existRecordProjectName = '';
        for (let i = 0; i < selectedRowKeys.length; i++) {
            const result = await ProjectApi.existRecord(selectedRowKeys[i]);
            if (result.result) {
                existRecordProjectName += data.find(d => d.id === selectedRowKeys[i]).name + ',';
            }
        }
        if (existRecordProjectName.length > 0) {
            existRecordProjectName = existRecordProjectName.substring(0, existRecordProjectName.length - 1);
        }
        return existRecordProjectName;
    }

    return (
        <div>
            <div style={{padding: "10px 0px", textAlign: "right"}}>
                <Button style={{marginRight: "10px"}} onClick={() => navigate('/addProject')}>添加</Button>
                <Button type="primary" onClick={onDelete} disabled={!hasSelected}>删除</Button>
            </div>
            <Table columns={columns} dataSource={data} rowSelection={rowSelection}/>
        </div>
    )
}

export default ProjectList;

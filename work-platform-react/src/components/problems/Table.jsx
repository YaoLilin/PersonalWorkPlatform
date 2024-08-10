import {Button, Table, Tag} from "antd";
import React, {useState} from "react";

const ProblemsTable= ({dataSource,onClickTitle,rowSelection,tableOperation})=>{
    const columns = [
        {
            dataIndex: 'weekDate',
            title:'周日期',
            width: '10%',
            sorter:(a,b) => new Date(b.weekDate).getTime() - new Date(a.weekDate).getTime()
        },
        {
            dataIndex: 'title',
            title: '标题',
            width:'25%',
            render:(text,record)=>{

                return <a onClick={()=>{
                    onClickTitle(record);
                }
                }>{text}</a>
            }
        },
        {
            dataIndex: 'resolve',
            title: '解决方案',
            width:'35%'
        },
        {
            dataIndex: 'state',
            title: '状态',
            width:'10%',
            render :(text, record)=>{
                if (text === 0){
                    return <Tag color="orange">未解决</Tag>;
                }else if (text === 1){
                    return <Tag color="blue">已解决</Tag>;
                }else {
                    return <span></span>
                }
            }
        },
        {
            dataIndex: 'level',
            title: '级别',
            width:'10%',
            render:(text,record)=>{
                if (text === 1){
                    return <span >低</span>
                }else {
                    return <span style={{color:'red'}}>高</span>
                }
            }
        },
        {
            dataIndex: 'operation',
            title: '操作',
            width:'10%',
            render:(text,record)=>{
                const content = record.state === 0 ? '完成' : '撤回'
                return <Button onClick={()=>{
                    tableOperation(record.id,record.state)
                }
                }>{content}</Button>
            }
        }
    ]

    return (
        <Table columns={columns} dataSource={dataSource} rowSelection={rowSelection}/>
    )
}

export default ProblemsTable;
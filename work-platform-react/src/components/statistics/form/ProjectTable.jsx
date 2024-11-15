import {Button, DatePicker, Table, TimePicker} from "antd";
import React, {useState} from "react";
import BrowserInput from "../../public/projectBrowser";
import dayjs from "dayjs";
import DateUtil from "../../../util/DateUtil";
import weekOfYear from "dayjs/plugin/weekOfYear"
import { v4 as uuidv4 } from 'uuid';

dayjs.extend(weekOfYear)
const ProjectTable = (props) => {
    const {onChange,data,week,isEdit} = props;

    const getDataItem = (key)=>{
        let result;
        data.forEach(item => {
            if (item.key === key) {
                result = item;
            }
        });
        return result;
    }

    const disabledDate = (current)=>{
        let startDate = dayjs();
        let endDate = dayjs();
        if (week){
            const {startDate : stDate , endDate : edDate} = DateUtil.getWeekRange(week.week(),week.year());
            startDate = dayjs(stDate);
            endDate = dayjs(edDate).hour(23).minute(59).second(59);
        }
        return week !== undefined ? current < startDate  || current > endDate : false ;
    }

    const columns = [
        {
            title: '日期',
            dataIndex: 'date',
            key: 'date',
            with: '25%',
            render: (text, record) => {
                if (isEdit){
                    let startDate;
                    if (text !== '') {
                        startDate = dayjs(text, 'YYYY-MM-DD');
                    }
                    let defaultPickerValue = "";
                    if (week){
                        defaultPickerValue = dayjs(week.format('YYYY-MM-DD'));
                    }
                    return <DatePicker style={{width: '140px'}}
                                       disabledDate={disabledDate}
                                       defaultValue={startDate}
                                       defaultPickerValue={defaultPickerValue}
                                       onChange={(e) => {
                                           getDataItem(record.key).date =e ? e.format('YYYY-MM-DD') :'';
                                           onChange(data);
                                       }
                                       }/>
                }
                return <span>{text}</span>
            },
            sorter: (rowA, rowB) => new Date(rowB.date).getTime() - new Date(rowA.date).getTime(),
            defaultSortOrder: 'descend',
        },
        {
            title: '项目',
            dataIndex: 'project',
            key: 'project',
            with: '25%',
            render: (text, record) => {
                if (isEdit){
                    return <BrowserInput style={{width: '140px'}}
                                         value={text ? {id:text.value,name:text.showName} : null}
                                         onChange={(obj)=>{
                                            getDataItem(record.key).project =obj ? {value:obj.id,showName:obj.name}
                                            : null;
                                            onChange(data);
                                         }
                                        }
                            />
                }
                return <a>{text.showName}</a>
            },
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            with: '25%',
            render: (text, record) => {
                if (isEdit){
                    let time = '';
                    if (text !==''){
                        time = dayjs(text,'HH:mm');
                    }
                    return <TimePicker style={{width: '140px'}} defaultValue={time} format={'HH:mm'} onChange={(time,timeString)=>{
                        getDataItem(record.key).startTime = time.format('HH:mm');
                        onChange(data);
                    }}/>
                }
                return <span>{text}</span>
            },
        },
        {
            title: '结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
            with: '25%',
            render: (text, record) => {
                if (isEdit){
                    let time = '';
                    if (text !==''){
                        time = dayjs(text,'HH:mm');
                    }
                    return <TimePicker style={{width: '140px'}}  defaultValue={time} format={'HH:mm'} onChange={(time,timeString)=>{
                        getDataItem(record.key).endTime = time.format('HH:mm');
                        onChange(data);
                    }}/>
                }
                return <span>{text}</span>
            },
        },
    ];

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const onAdd = () => {
        const newData = data.slice(0);
        newData.push({key: uuidv4(), date: '', startTime: '', endTime: '', progress: ''})
        onChange(newData);
    }
    const onCopy = () => {
        const newData = data.slice(0);
        data.forEach(i => {
            if (selectedRowKeys.indexOf(i.key) !== -1) {
                const newItem = {...i};
                newItem.key = uuidv4();
                newData.push(newItem);
            }
        });
        onChange(newData);
    }
    const onDelete = () => {
        let newData = [];
        data.forEach(item => {
            if (selectedRowKeys.indexOf(item.key) === -1) {
                newData.push(item);
            }
        });
        onChange(newData);
        setSelectedRowKeys([]);
    }
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    return (
        <>
            {
                isEdit ?  <div style={{paddingBottom: 10, textAlign: "right"}}>
                    <Button style={{marginRight: "10px"}} onClick={() => onAdd()}>添加</Button>
                    <Button disabled={!hasSelected} style={{marginRight: "10px"}} onClick={() => onCopy()}>复制</Button>
                    <Button type="primary" disabled={!hasSelected} onClick={() => onDelete()}>删除</Button>
                </div>
                    : null
            }
            <Table columns={columns} dataSource={data} bordered rowSelection={isEdit ? rowSelection : null}/>
        </>
    )
}

export default ProjectTable;

import {Button, DatePicker, Select} from "antd";
import React, {useState} from "react";
const {RangePicker} = DatePicker;

// 查询条件组
export default (props)=>{
    const {onChange,style} = props;
    const [condition, setCondition] = useState({
        dateRange:null,
        state:null,
        level:null
    });
    const onDateRangeChanged =(date)=>{
        condition.dateRange = date;
        setCondition(condition);
        onChange(condition);
    }

    const onStateSelected = (v)=>{
        condition.state = v;
        setCondition(condition);
        onChange(condition);
    }

    const onLevelSelected = (v)=>{
        condition.level = v;
        setCondition(condition);
        onChange(condition);
    }

    return (
        <div style={{...style}}>
            <div style={{display: "flex"}}>
                <div style={{paddingLeft: 20}}>
                    时间范围：<RangePicker picker="week" onChange={onDateRangeChanged}/>
                </div>
                <div style={{paddingLeft: 20}}>
                    状态：
                    <Select options={[
                        {
                            value: 0,
                            label: '未解决',
                        },
                        {
                            value: 1,
                            label: '已解决',
                        },
                    ]
                    }
                            style={{width: 100}}
                            allowClear
                            onClear={()=>{
                                delete condition.state;
                                setCondition(condition);
                                onChange(condition);
                            }}
                            onSelect={onStateSelected}
                    />
                </div>
                <div style={{paddingLeft: 20}}>
                    级别：
                    <Select options={[
                        {
                            value: 1,
                            label: '低',
                        },
                        {
                            value: 2,
                            label: '高',
                        },
                    ]
                    }
                            style={{width: 100}}
                            allowClear
                            onClear={()=>{
                                delete condition.level;
                                setCondition(condition);
                                onChange(condition)
                            }}
                            onSelect={onLevelSelected}
                    />
                </div>
            </div>
        </div>
    )
}
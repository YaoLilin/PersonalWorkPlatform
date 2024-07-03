import React, {useEffect, useState} from 'react';
import {DatePicker, Select, Space} from 'antd';
import './index.css';

const {Option} = Select;

const dataMapping = {};

function fetchDataForRange(start, end) {
    // 实现根据开始和结束日期调用后端接口获取数据的逻辑
}

function fetchDataForFixedPeriod(periodFunc) {
    periodFunc();
}

const WeekTimeChart = () => {
    const [selectedDateRange, setSelectedDateRange] = useState(0);
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [countType, setCountType] = useState(0);
    const [selectedProject, setSelectedProject] = useState(0);
    const [selectedType, setSelectedType] = useState(0);


    const handleDateChange = (value) => {
        setSelectedDateRange(value);
    };

    const handleCustomDateChange = (dates) => {
        if (dates && dates.length === 2) {
            if (dates[0]) {
                setCustomStartDate(dates[0].day(1).format('YYYY-MM-DD'));
            }
            if (dates[1]) {
                setCustomEndDate(dates[1].day(1).format('YYYY-MM-DD'));
            }
        }
    };

    useEffect(() => {
        if (customStartDate && customEndDate) {
            fetchDataForRange(customStartDate, customEndDate);
        }
    }, [customStartDate, customEndDate]);

    // 假设fetchData...函数会返回一个Promise，解析后设置chartData
    // 然后根据chartData生成options对象用于ECharts

    const options = {
        xAxis: {
            type: 'category',
            data: chartData.map(item => item.weekStart), // 假设每个item有weekStart属性表示周开始日期
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                data: chartData.map(item => item.value), // 假设每个item有value属性表示项目数量
                type: 'bar',
            },
        ],
    };

    return (
        <div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10,fontSize:12}}>
                <div style={{display: 'flex', gap: 20}}>
                    <div style={{display: "flex", alignItems: 'center'}}>
                        <span>选择日期：</span>
                        <Space direction="horizontal" size={12}>
                            <Select value={selectedDateRange} onChange={handleDateChange} size={"small"} style={{width:100}}>
                                <Option value={0}>近4周</Option>
                                <Option value={1}>近12周</Option>
                                <Option value={2}>近半年</Option>
                                <Option value={3}>自定义日期</Option>
                            </Select>
                            {selectedDateRange === 3 && (
                                <DatePicker.RangePicker
                                    picker={'week'}
                                    size={"small"}
                                    onCalendarChange={handleCustomDateChange}
                                />
                            )}
                        </Space>
                    </div>
                </div>
                <div style={{display: 'flex', gap: 20}}>
                    <div style={{display: "flex", alignItems: 'center'}}>
                        <span>统计纬度：</span>
                        <Select style={{width: '100px'}}
                                size={"small"}
                                value={countType}
                                onChange={e => setCountType(e)}>
                            <Option value={0}>项目</Option>
                            <Option value={1}>类型</Option>
                        </Select>
                    </div>
                    {countType === 0 &&
                        <div style={{display: "flex", alignItems: 'center'}}>
                            <span>项目：</span>
                            <Select style={{width: '100px'}}
                                    size={"small"}
                                    value={selectedProject}
                                    onChange={e => setSelectedProject(e)}>
                                <Option value={0}>java</Option>
                                <Option value={1}>骑行训练</Option>
                                <Option value={2}>英语</Option>
                            </Select>
                        </div>
                    }
                    {countType === 1 &&
                        <div style={{display: "flex", alignItems: 'center'}}>
                            <span>类型：</span>
                            <Select style={{width: '100px'}}
                                    size={"small"}
                                    value={selectedType}
                                    onChange={e => setSelectedType(e)}>
                                <Option value={0}>编程</Option>
                                <Option value={1}>锻炼</Option>
                            </Select>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default WeekTimeChart;
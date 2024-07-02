
import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Button, Space } from 'antd';
import ECharts from 'echarts-for-react';
import moment from 'moment';

const { Option } = Select;

const dataMapping = {

};

function fetchDataForRange(start, end) {
    // 实现根据开始和结束日期调用后端接口获取数据的逻辑
}

function fetchDataForFixedPeriod(periodFunc) {
    periodFunc();
}

const BarChart = () => {
    const [selectedDateRange, setSelectedDateRange] = useState('近4周');
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchDataForFixedPeriod(dataMapping[selectedDateRange]);
    }, [selectedDateRange]);

    const handleDateChange = (value) => {
        setSelectedDateRange(value);
    };

    const handleCustomDateChange = (dates) => {
        if (dates && dates.length === 2) {
            setCustomStartDate(dates[0].startOf('week').format('YYYY-MM-DD'));
            setCustomEndDate(dates[1].endOf('week').format('YYYY-MM-DD'));
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
            <Space direction="vertical" size={12}>
                <Select value={selectedDateRange} onChange={handleDateChange}>
                    <Option value="近4周">近4周</Option>
                    <Option value="近12周">近12周</Option>
                    <Option value="近半年">近半年</Option>
                    <Option value="自定义日期">自定义日期</Option>
                </Select>
                {selectedDateRange === '自定义日期' && (
                    <DatePicker.RangePicker
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        onCalendarChange={handleCustomDateChange}
                    />
                )}
            </Space>
            <ECharts option={options} />
        </div>
    );
};

export default BarChart;
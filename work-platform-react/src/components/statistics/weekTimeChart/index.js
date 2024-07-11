import React, {useEffect, useState} from 'react';
import {DatePicker, Select, Space} from 'antd';
import './index.css';
import ChartConditions from "./ChartConditions";
import BaseBarChart from "./BaseBarChart";
import {Chart} from "@antv/g2";
import {Column} from "@ant-design/charts";
const {Option} = Select;



const WeekTimeChart = () => {
    const handleConditionChange = ({selectedDateRange, customStartDate,customEndDate,selectedCountType, selectedProject,
        selectedType})=>{
        console.log(`selectedDateRange: ${selectedDateRange}, customStartDate: ${customStartDate}, 
        customEndDate: ${customEndDate}, selectedCountType: ${selectedCountType}, selectedProject: ${selectedProject}, 
        selectedType: ${selectedType}`)
    }

    const data = [
        {week:'2024-07-01',type:'项目1',value:10},
        {week:'2024-07-01',type:'项目2',value:20},
        {week:'2024-07-08',type:'项目1',value:10},
        {week:'2024-07-08',type:'项目2',value:1}
    ];

    const config = {
        data,
        xField: 'week',
        yField: 'value',
        colorField:'type',
        stack: {
            groupBy: ['x', 'series'],
            series: false,
        },
        tooltip:{
            items: [
                {
                    field:'value',
                    valueFormatter: (value)=>`${value} 分钟`
                }
            ],
        },
        style:{
            radiusTopLeft: 8,
            radiusTopRight: 8,
            maxWidth: 30
        }
    };

    return (
        <div>
            <ChartConditions onChange={handleConditionChange}/>
            <div  style={{height:300}} >
              <Column {...config} />
            </div>
        </div>
    );
};

export default WeekTimeChart;
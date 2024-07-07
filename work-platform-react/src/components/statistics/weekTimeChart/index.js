import React, {useEffect, useState} from 'react';
import {DatePicker, Select, Space} from 'antd';
import './index.css';
import ChartConditions from "./ChartConditions";
import BaseBarChart from "./BaseBarChart";
import {Chart} from "@antv/g2";
const {Option} = Select;



const WeekTimeChart = () => {
    const rendChart = ()=>{
        const chart = new Chart({
            container: 'week-time-chart',
            autoFit: true,
        });

        chart.data([
            { week: '2024-07-01', minutes: 65 },
            { week: '2024-07-08', minutes: 115 },
            { week: '2024-07-15', minutes: 80 },
            { week: '2024-07-22', minutes: 40 },
        ]);

        chart
            .interval()
            .encode('x', 'week')
            .encode('y', 'minutes');

        chart.render();
    }

    const handleConditionChange = ({selectedDateRange, customStartDate,customEndDate,selectedCountType, selectedProject,
        selectedType})=>{
        console.log(`selectedDateRange: ${selectedDateRange}, customStartDate: ${customStartDate}, 
        customEndDate: ${customEndDate}, selectedCountType: ${selectedCountType}, selectedProject: ${selectedProject}, 
        selectedType: ${selectedType}`)
    }

    return (
        <div>
            <ChartConditions onChange={handleConditionChange}/>
            <div id={'week-time-chart'} ref={()=>rendChart()} style={{height:300}} />
        </div>
    );
};

export default WeekTimeChart;
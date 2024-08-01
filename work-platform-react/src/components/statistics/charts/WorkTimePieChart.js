import ReactECharts from "echarts-for-react";
import MonthTimeChartCondition from "./MonthTimeChartCondition";
import React, {useMemo, useState} from "react";
import useChartApiData from "./useChartApiData";
import {ChartApi} from "../../../request/chartApi";

const WorkTimePieChart = () => {
    const [condition, setCondition] = useState({dateRangeType:4});
    const apiData = useChartApiData(condition,ChartApi.workTimeProportion);
    const chartData = apiData.map(i =>({
        name:i.name,
        value:i.count
    }));

    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'horizontal',
            left: 'center',
            top:'0%'
        },
        series: [
            {
                name: 'work time',
                type: 'pie',
                radius: '60%',
                center: ['50%', '60%'],
                data: chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    const handleConditionChange = (condition) => {
        setCondition(condition);
    }

    return(
        <div>
            <MonthTimeChartCondition onChange={handleConditionChange}/>
            <div style={{paddingTop:10}}>
                <ReactECharts option={option} notMerge/>
            </div>
        </div>
    )
}

export default WorkTimePieChart;
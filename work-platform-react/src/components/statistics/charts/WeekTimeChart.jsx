import React, {useState} from 'react';
import './index.css';
import WeekTimeChartConditions from "./WeekTimeChartConditions";
import useChartApiData from "./useChartApiData";
import {ChartApi} from "../../../request/chartApi";
import ReactECharts from 'echarts-for-react';
import useChartData from "./useChartData";
import useBarChartOption from "./useBarChartOption";

const WeekTimeChart = () => {
    const [condition, setCondition] = useState({});
    const apiData = useChartApiData(condition,ChartApi.weekTimeCount);
    const {seriesData, xName,categories} = useChartData(apiData);
    const option = useBarChartOption(seriesData,categories,xName,1200,'分钟');
    const handleConditionChange = (condition) => {
        setCondition(condition);
    }

    return (
        <div>
            <WeekTimeChartConditions onChange={handleConditionChange}/>
            <div style={{height: 300,paddingTop:10}}>
                <ReactECharts option={option} notMerge/>
            </div>
        </div>
    );
};

export default WeekTimeChart;